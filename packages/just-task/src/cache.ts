import { getPackageDeps } from '@microsoft/package-deps-hash';
import { argv } from './option';
import { resolveCwd } from './resolve';
import fs from 'fs-extra';
import path from 'path';
import { logger } from 'just-task-logger';

const cachedTask: string[] = [];

export function registerCachedTask(taskName: string) {
  cachedTask.push(taskName);
}

export function isCached(taskName: string) {
  if (cachedTask.indexOf(taskName) < 0) {
    return false;
  }

  const currentHash = getHash(taskName);
  const cachePath = getCachePath();
  const cacheFile = path.join(cachePath, 'package-deps.json');

  if (!fs.existsSync(cacheFile)) {
    return false;
  }

  if (!fs.pathExistsSync(cachePath)) {
    fs.mkdirpSync(cachePath);
  }

  try {
    const cachedHash = JSON.parse(fs.readFileSync(path.join(cachePath, 'package-deps.json')).toString());

    // TODO: make a more robust comparison
    return JSON.stringify(currentHash) === JSON.stringify(cachedHash);
  } catch (e) {
    logger.warn('Invalid package-deps.json detected');
  }

  return false;
}

export function saveCache(taskName: string) {
  if (cachedTask.indexOf(taskName) < 0) {
    return;
  }

  const cachePath = getCachePath();

  if (!fs.pathExistsSync(cachePath)) {
    fs.mkdirpSync(cachePath);
  }

  fs.writeFileSync(path.join(cachePath, 'package-deps.json'), JSON.stringify(getHash(taskName)));
}

function getCachePath() {
  const packageJsonFilePath = resolveCwd('package.json')!;
  const rootPath = path.dirname(packageJsonFilePath);
  return path.join(rootPath, 'node_modules/.just');
}

function getHash(taskName: string) {
  const { $0: scriptNameArg, ...args } = argv();
  const hash = getPackageDeps();

  return {
    args,
    taskName,
    hash
  };
}
