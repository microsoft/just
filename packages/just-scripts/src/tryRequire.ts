import { logger, resolve } from 'just-task';
import fse from 'fs-extra';
import path from 'path';
import type { PackageJson } from './interfaces/PackageJson';

/**
 * Try requiring a module, respecting the resolution logic from {@link resolve} and including
 * `just-scripts` as a resolution starting point.
 */
export function tryRequire<T>(specifier: string): T | null {
  const resolved = resolveWrapper(specifier);
  if (!resolved) {
    return null;
  }

  try {
    return require(resolved) as T;
  } catch (e) {
    // If the path is resolved but the module can't be loaded, this implies some issue (likely
    // ESM/CJS interop) which should be surfaced to the user
    logger.warn(`Error loading "${specifier}" (resolved: "${resolved}"): ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

/**
 * Calls {@link resolve} with the `dirname` set to this file, so that resolution is also
 * tried from the `just-scripts` package location.
 */
export function resolveWrapper(modulePath: string): string | null {
  return resolve(modulePath, { dirname: __dirname });
}

/**
 * Call {@link resolveWrapper} for `${pkgName}/package.json` and return the `bin` field for the
 * specified `binName` (or the default bin if `binName` is not specified).
 */
export function resolveBin(pkgName: string, binName?: string): string | null {
  const packageJsonPath = resolveWrapper(`${pkgName}/package.json`);
  const packageJson = packageJsonPath && (fse.readJsonSync(packageJsonPath, { throws: false }) as PackageJson | null);
  if (!packageJson) {
    return null;
  }

  let binPath: string | null = null;
  if (typeof packageJson.bin === 'string') {
    binPath = binName && binName !== pkgName ? null : packageJson.bin;
  } else if (packageJson.bin) {
    binPath = packageJson.bin[binName || pkgName] || null;
  }
  return binPath ? path.resolve(path.dirname(packageJsonPath), binPath) : null;
}
