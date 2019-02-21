import { sync as resolveSync } from 'resolve';
import path from 'path';
import yargs from 'yargs';

let resolvePaths: string[] = [];

/**
 * Add a path to the list used by `resolve()`.
 * @param pathName Path to add
 */
export function addResolvePath(pathName: string): void {
  resolvePaths.push(pathName);
}

/**
 * Reset the list of paths used by `resolve()`.
 */
export function resetResolvePaths(): void {
  resolvePaths = [];
}

/**
 * Exported for testing only.
 * @private
 */
export function _isFileNameLike(name: string): boolean {
  return !!name && name.includes('.') && !name.includes('/') && !name.includes('\\');
}

/**
 * Exported for testing only.
 * @private
 */
export function _tryResolve(moduleName: string, basedir: string): string | null {
  try {
    if (_isFileNameLike(moduleName)) {
      return resolveSync(`./${moduleName}`, { basedir, preserveSymlinks: true });
    } else {
      return resolveSync(moduleName, { basedir, preserveSymlinks: true });
    }
  } catch (e) {
    return null;
  }
}

/**
 * Resolve a module. Resolution will be tried starting from `cwd`, the location of a config file
 * passed using the `--config` command line arg, and any paths added using `addResolvePath`.
 * @param moduleName Module name to resolve. Anything which appears to be a file name (contains .
 * and doesn't contain slashes) will be resolved relative to the working directory.
 * Other names will be resolved within node_modules.
 * @param cwd Working directory in which to start resolution. Defaults to `process.cwd()`.
 * @returns The module path, or null if the module can't be resolved.
 */
export function resolve(moduleName: string, cwd?: string): string | null {
  if (!cwd) {
    cwd = process.cwd();
  }
  const configArg = yargs(process.argv.slice(1).filter(a => a !== '--help')).argv.config;
  const configFilePath = configArg ? path.resolve(path.dirname(configArg)) : undefined;

  const allResolvePaths = [cwd, ...(configFilePath ? [configFilePath] : []), ...resolvePaths];
  let resolved: string | null = null;

  for (let tryPath of allResolvePaths) {
    resolved = _tryResolve(moduleName, tryPath);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

/**
 * Resolve a module. Resolution will *only* be tried starting from `cwd` (does not respect
 * `--config` arg or `addResolvePath`).
 * @param moduleName Module name to resolve. Anything which appears to be a file name (contains .
 * and doesn't contain slashes) will be resolved relative to the working directory.
 * Other names will be resolved within node_modules.
 * @param cwd Working directory in which to start resolution. Defaults to `process.cwd()`.
 * @returns The module path, or null if the module can't be resolved.
 */
export function resolveCwd(moduleName: string, cwd?: string): string | null {
  if (!cwd) {
    cwd = process.cwd();
  }
  return _tryResolve(moduleName, cwd);
}
