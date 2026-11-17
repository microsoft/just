import path from 'path';
import { pathToFileURL } from 'url';
import { logger } from './logger';

/**
 * Import a file, resolving relative paths from `process.cwd()` and preserving its module namespace.
 * Logs failures and rethrows the original error. Resolve package specifiers before calling this helper.
 */
export async function importModule<T = Record<string, unknown>>(filePath: string): Promise<T> {
  try {
    return (await import(pathToFileURL(path.resolve(filePath)).href)) as T;
  } catch (error) {
    logger.error(`Error importing "${filePath}": ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
