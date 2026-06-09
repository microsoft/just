import { logger, resolve } from 'just-task';

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
