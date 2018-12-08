import * as resolveFn from 'resolve';
import path from 'path';

const yargsFn = require('yargs/yargs');
const resolvePaths: string[] = [];

export function addResolvePath(pathName: string) {
  resolvePaths.push(pathName);
}

export function resolve(moduleName: string) {
  const configArg = yargsFn(process.argv.slice(1).filter(a => a !== '--help')).argv.config;
  const configFilePath = configArg ? path.resolve(path.dirname(configArg)) : undefined;

  try {
    return resolveFn.sync(moduleName, { basedir: process.cwd(), preserveSymlinks: true });
  } catch (e) {
    // pass
  }

  if (configFilePath) {
    try {
      return resolveFn.sync(moduleName, { basedir: configFilePath, preserveSymlinks: true });
    } catch (e) {
      // pass
    }
  }

  for (let resolvePath of resolvePaths) {
    try {
      return resolveFn.sync(moduleName, { basedir: resolvePath, preserveSymlinks: true });
    } catch (e) {
      // pass
    }
  }

  return null;
}
