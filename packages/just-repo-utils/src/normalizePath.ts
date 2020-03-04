import path from 'path';

/**
 * take a path and make sure it uses forward slashes
 * @param base - path to put into forward slashed form
 */
export function normalizePath(base: string): string {
  return path.normalize(base).replace(/\\/g, '/');
}
