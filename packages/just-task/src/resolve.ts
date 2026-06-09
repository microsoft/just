import { sync as resolveSync } from 'resolve';
import path from 'path';
import { argv } from './option';

export interface ResolveOptions {
  /** Directory to start resolution from. Defaults to `process.cwd()`. */
  cwd?: string;
  /** If calling from another package, the directory of the calling file */
  dirname?: string;
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
    const { cwd, dirname, ...rest } = options;
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
export function _getResolvePaths(options: Pick<ResolveOptions, 'cwd' | 'dirname'> = {}): string[] {
  const { dirname } = options;
  const cwd = options.cwd || process.cwd();

  const configArg = argv().config as string | undefined;
  const configFilePath = configArg ? path.resolve(path.dirname(configArg)) : undefined;

  return [
    cwd,
    ...(configFilePath ? [configFilePath] : []),
    ...customResolvePaths,
    ...(dirname ? [dirname] : []),
    __dirname,
  ];
}

/**
 * Resolve a module. Resolution will be tried starting from:
 * 1. `cwd`
 * 2. the location of a config file passed using the `--config` command line arg
 * 3. any paths added using `addResolvePath`
 * 4. the location of the calling file, if `dirname` is provided
 * 5. the location of the `just-task` package
 * @param moduleName Module name to resolve. Anything which appears to be a file name (contains .
 * and doesn't contain slashes) will be resolved relative to the working directory.
 * Other names will be resolved within node_modules.
 * @param options Resolution options, including custom cwd (defaults to `process.cwd()`)
 * @returns The module path, or null if the module can't be resolved.
 */
export function resolve(moduleName: string, options?: ResolveOptions): string | null {
  const allResolvePaths = _getResolvePaths(options);

  for (const tryPath of allResolvePaths) {
    const resolved = _tryResolve(moduleName, { ...options, cwd: tryPath });
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
export function resolveCwd(moduleName: string, options?: ResolveOptions): string | null {
  const cwd = options?.cwd || process.cwd();
  return _tryResolve(moduleName, { ...options, cwd });
}
