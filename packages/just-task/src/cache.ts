import { getPackageDeps } from '@rushstack/package-deps-hash';
import { argv } from './option';
import { resolveCwd } from './resolve';
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger, mark } from './logger';
import { findDependents } from './package/findDependents';
import { findGitRoot } from './package/findGitRoot';
import { spawnSync } from 'child_process';

const cachedTask: string[] = [];
const CacheFileName = 'package-deps.json';

export function registerCachedTask(taskName: string): void {
  cachedTask.push(taskName);
}

export function clearCache(): void {
  const cachePath = getCachePath();
  const cacheFile = path.join(cachePath, CacheFileName);

  if (fs.existsSync(cacheFile)) {
    fs.removeSync(cacheFile);
  }
}

export function isCached(taskName: string): boolean {
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

export function saveCache(taskName: string): void {
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

function getPackageRootPath() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const packageJsonFilePath = resolveCwd('package.json')!;
  return path.dirname(packageJsonFilePath);
}

function getCachePath() {
  const rootPath = getPackageRootPath();
  return path.join(rootPath, 'node_modules/.just');
}

interface CacheHash {
  args: { [arg: string]: string };
  taskName: string;
  hash: Record<string, string>;
  dependentHashTimestamps: { [pkgName: string]: number };
}

function getLockFileHashes(): { [file: string]: string } {
  const results: { [file: string]: string } = {};

  const lockFiles = ['shrinkwrap.yml', 'package-lock.json', 'yarn.lock', 'pnpmfile.js'];
  const gitRoot = findGitRoot();
  const lsFileResults = spawnSync('git', ['ls-files', ...lockFiles], { cwd: gitRoot });
  if (lsFileResults.status !== 0) {
    return {};
  }

  const foundLockFiles = lsFileResults.stdout
    .toString()
    .split(/\n/)
    .map(l => l.trim());

  const hashResults = spawnSync('git', ['hash-object', ...foundLockFiles], { cwd: gitRoot });

  if (hashResults.status !== 0) {
    return {};
  }

  const hashes = hashResults.stdout
    .toString()
    .split(/\n/)
    .map(l => l.trim());

  foundLockFiles.forEach((foundLockFile, index) => {
    results[foundLockFile] = hashes[index];
  });

  return results;
}

function getHash(taskName: string): CacheHash | null {
  mark('cache:getHash');

  const { ...args } = argv();

  const packageRootPath = getPackageRootPath();

  const packageDeps = {
    ...Object.fromEntries(getPackageDeps(packageRootPath)),
    ...getLockFileHashes(),
  };

  const hash = {
    args,
    taskName,
    hash: packageDeps,
    dependentHashTimestamps: getDependentHashTimestamps(),
  };

  logger.perf('cache:getHash');

  return hash;
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
