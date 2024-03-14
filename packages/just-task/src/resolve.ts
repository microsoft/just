import { sync as resolveSync } from 'resolve';
import * as fs from 'fs';
import * as path from 'path';
import { argv } from './option';
import { fileURLToPath, pathToFileURL } from 'url';

export interface ResolveOptions {
  /** Directory to start resolution from. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Array of file extensions to search in order */
  extensions?: string[];
}

let customResolvePaths: string[] = [];

/**
 * Add a path to the list used by `resolve()`.
 * @param pathName Path to add
 */
export function addResolvePath(pathName: string): void {
  customResolvePaths.push(pathName);
}

/**
 * Reset the list of paths used by `resolve()`.
 */
export function resetResolvePaths(): void {
  customResolvePaths = [];
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
export function _tryResolve(moduleName: string, options: ResolveOptions): string | null {
  try {
    const { cwd, ...rest } = options;
    const nameToResolve = _isFileNameLike(moduleName) ? `./${moduleName}` : moduleName;
    return resolveSync(nameToResolve, { basedir: cwd, ...rest, preserveSymlinks: true });
  } catch (e) {
    return null;
  }
}

/**
 * Exported for testing only.
 * @private
 */
export function _getResolvePaths(cwd?: string): string[] {
  if (!cwd) {
    cwd = process.cwd();
  }

  const configArg = argv().config;
  const configFilePath = configArg ? path.resolve(path.dirname(configArg)) : undefined;

  return [cwd, ...(configFilePath ? [configFilePath] : []), ...customResolvePaths, __dirname];
}

/**
 * Resolve a module. Resolution will be tried starting from `cwd`, the location of a config file
 * passed using the `--config` command line arg, and any paths added using `addResolvePath`.
 * @param moduleName Module name to resolve. Anything which appears to be a file name (contains .
 * and doesn't contain slashes) will be resolved relative to the working directory.
 * Other names will be resolved within node_modules.
 * @param options Resolution options, including custom cwd (defaults to `process.cwd()`)
 * @returns The module path, or null if the module can't be resolved.
 */
export function resolve(moduleName: string, options?: ResolveOptions): string | null;
/**
 * Resolve a module. Resolution will be tried starting from `cwd`, the location of a config file
 * passed using the `--config` command line arg, and any paths added using `addResolvePath`.
 * @deprecated Use object params signature instead.
 * @param moduleName Module name to resolve. Anything which appears to be a file name (contains .
 * and doesn't contain slashes) will be resolved relative to the working directory.
 * Other names will be resolved within node_modules.
 * @param cwd Working directory in which to start resolution. Defaults to `process.cwd()`.
 * @returns The module path, or null if the module can't be resolved.
 */
export function resolve(moduleName: string, cwd?: string): string | null;
export function resolve(moduleName: string, cwdOrOptions?: string | ResolveOptions): string | null {
  let options: ResolveOptions = {};
  if (typeof cwdOrOptions === 'string') {
    options = { cwd: cwdOrOptions };
  } else if (cwdOrOptions) {
    options = cwdOrOptions;
  }

  const allResolvePaths = _getResolvePaths(options.cwd);
  let resolved: string | null = null;

  for (const tryPath of allResolvePaths) {
    resolved = _tryResolve(moduleName, { ...options, cwd: tryPath });
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
 * @param options Resolution options, including custom cwd (defaults to `process.cwd()`)
 * @returns The module path, or null if the module can't be resolved.
 */
export function resolveCwd(moduleName: string, options?: ResolveOptions): string | null;
/**
 * Resolve a module. Resolution will *only* be tried starting from `cwd` (does not respect
 * `--config` arg or `addResolvePath`).
 * @deprecated Use object params signature instead.
 * @param moduleName Module name to resolve. Anything which appears to be a file name (contains .
 * and doesn't contain slashes) will be resolved relative to the working directory.
 * Other names will be resolved within node_modules.
 * @param cwd Working directory in which to start resolution. Defaults to `process.cwd()`.
 * @returns The module path, or null if the module can't be resolved.
 */
export function resolveCwd(moduleName: string, cwd?: string): string | null;
export function resolveCwd(moduleName: string, cwdOrOptions?: string | ResolveOptions): string | null {
  let options: ResolveOptions = {};
  if (typeof cwdOrOptions === 'string') {
    options = { cwd: cwdOrOptions };
  } else if (cwdOrOptions) {
    options = cwdOrOptions;
  }
  if (!options.cwd) {
    options.cwd = process.cwd();
  }
  return _tryResolve(moduleName, options);
}

let importMetaResolve: ((specifier: string, parent: string) => string) | undefined;
/**
 * Resolve a module relative to `cwd` (default `process.cwd()`) using `import-meta-resolve`.
 * Returns the resolved module if it exists, or null otherwise.
 */
export async function resolveModern(moduleName: string, cwd?: string): Promise<string | null> {
  if (process.env.JEST_WORKER_ID) {
    // For some reason, the dynamic import below causes a segfault in Jest.
    // This issue appears to be specific to Jest (doesn't repro when building `example-lib` in the
    // just repo), so just fall back to the old resolver in that case.
    return null;
  }

  importMetaResolve ||= (await import('import-meta-resolve')).resolve;
  // import-meta-resolve needs a parent path ending in a filename in the correct directory
  // (doesn't matter whether the file exists)
  const parent = pathToFileURL(path.join(cwd || process.cwd(), 'package.json')).href;

  try {
    const resolved = fileURLToPath(importMetaResolve(moduleName, parent));
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  } catch {
    // ignore
  }
  return null;
}
