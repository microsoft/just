import path from 'path';

/**
 * take a path, call path.normalize, then make sure it uses forward slashes
 * @param base - path to put into forward slashed form
 */
export function normalizeToUnixPath(base: string): string {
  return path.normalize(base).replace(/\\/g, '/');
}
