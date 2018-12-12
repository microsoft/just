import * as resolveFn from 'resolve';
import path from 'path';

const yargsFn = require('yargs/yargs');
const resolvePaths: string[] = [];

export function addResolvePath(pathName: string) {
  resolvePaths.push(pathName);
}

function tryResolve(moduleName: string, basedir: string) {
  try {
    return resolveFn.sync(moduleName, { basedir, preserveSymlinks: true });
  } catch (e) {
    return null;
  }
}

export function resolve(moduleName: string, cwd?: string) {
  if (!cwd) {
    cwd = process.cwd();
  }
  const configArg = yargsFn(process.argv.slice(1).filter(a => a !== '--help')).argv.config;
  const configFilePath = configArg ? path.resolve(path.dirname(configArg)) : undefined;

  const allResolvePaths = [cwd, ...(configFilePath ? [configFilePath] : []), ...resolvePaths];
  let resolved: string | null = null;

  for (let tryPath of allResolvePaths) {
    resolved = tryResolve(moduleName, tryPath);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export function resolveCwd(moduleName: string, cwd?: string) {
  if (!cwd) {
    cwd = process.cwd();
  }
  return tryResolve(moduleName, cwd);
}
