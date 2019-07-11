import { getPackageDeps, IPackageDeps } from '@microsoft/package-deps-hash';
import { argv } from './option';
import { resolveCwd } from './resolve';
import fs from 'fs-extra';
import path from 'path';
import { logger, mark } from 'just-task-logger';
import { findGitRoot } from './package/findGitRoot';
import { findDependents } from './package/findDependents';

const cachedTask: string[] = [];
const CacheFileName = 'package-deps.json';

export function registerCachedTask(taskName: string) {
  cachedTask.push(taskName);
}

export function clearCache() {
  const cachePath = getCachePath();
  const cacheFile = path.join(cachePath, CacheFileName);

  if (fs.existsSync(cacheFile)) {
    fs.removeSync(cacheFile);
  }
}

export function isCached(taskName: string) {
  if (cachedTask.indexOf(taskName) < 0) {
    return false;
  }

  const currentHash = getHash(taskName);
  const cachePath = getCachePath();
  const cacheFile = path.join(cachePath, CacheFileName);

  if (!fs.existsSync(cacheFile)) {
    return false;
  }

  let shouldCache = false;

  try {
    const cachedHash = JSON.parse(fs.readFileSync(path.join(cachePath, CacheFileName)).toString());

    // TODO: make a more robust comparison
    shouldCache = JSON.stringify(currentHash) === JSON.stringify(cachedHash);
  } catch (e) {
    logger.warn('Invalid package-deps.json detected');
  }

  return shouldCache;
}

export function saveCache(taskName: string) {
  if (cachedTask.indexOf(taskName) < 0) {
    return;
  }

  const cachePath = getCachePath();

  if (!fs.pathExistsSync(cachePath)) {
    fs.mkdirpSync(cachePath);
  }

  const cacheHash = getHash(taskName);

  if (cacheHash) {
    fs.writeFileSync(path.join(cachePath, 'package-deps.json'), JSON.stringify(cacheHash, null, 2));
  }
}

function getCachePath() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const packageJsonFilePath = resolveCwd('package.json')!;
  const rootPath = path.dirname(packageJsonFilePath);
  return path.join(rootPath, 'node_modules/.just');
}

interface CacheHash {
  args: { [arg: string]: string };
  taskName: string;
  hash: IPackageDeps;
  dependentHashTimestamps: { [pkgName: string]: number };
}

function getHash(taskName: string): CacheHash | null {
  mark('cache:getHash');

  const { ...args } = argv();

  const gitRoot = findGitRoot();

  if (!gitRoot) {
    return null;
  }

  const packageDeps = getPackageDeps(gitRoot);

  const cwd = process.cwd();

  const files: typeof packageDeps.files = {};

  Object.keys(packageDeps.files).forEach(file => {
    const basename = path.basename(file);

    if (
      isChildOf(path.join(gitRoot, file), cwd) ||
      basename === 'shrinkwrap.yml' ||
      basename === 'package-lock.json' ||
      basename === 'yarn.lock' ||
      basename === 'pnpmfile.js'
    ) {
      files[file] = packageDeps.files[file];
    }
  });

  packageDeps.files = files;

  const hash = {
    args,
    taskName,
    hash: packageDeps,
    dependentHashTimestamps: getDependentHashTimestamps()
  };

  logger.perf('cache:getHash');

  return hash;
}

function isChildOf(child: string, parent: string) {
  const relativePath = path.relative(child, parent);
  return /^[.\/\\]+$/.test(relativePath);
}

function getDependentHashTimestamps() {
  mark('cache:getDependentHashTimestamps');
  const dependentPkgPaths = findDependents();

  const timestampsByPackage: { [pkgName: string]: number } = {};

  for (const pkgDepInfo of dependentPkgPaths) {
    const pkgPath = pkgDepInfo.path;
    const depHashFile = path.join(pkgPath, 'node_modules/.just', CacheFileName);
    const depPackageJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8'));

    if (fs.existsSync(depHashFile)) {
      const stat = fs.statSync(depHashFile);
      timestampsByPackage[pkgDepInfo.name] = stat.mtimeMs;
    } else if (depPackageJson.scripts) {
      // always updated if no hash file is found for dependants
      timestampsByPackage[pkgDepInfo.name] = new Date().getTime();
    }
  }

  logger.perf('cache:getDependentHashTimestamps');

  return timestampsByPackage;
}
