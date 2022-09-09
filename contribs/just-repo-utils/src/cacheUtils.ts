import { gitListFiles, gitHashObject } from './gitUtils';
import { getRepoInfo } from './repoInfo';
import * as path from 'path';
import * as fs from 'fs-extra';

/**
 * Processes the list of files (or globs), returns a set, then returns hash keys for those files
 * @param rootPath - root path to base the git query
 * @param files - file scopings for matching
 */
export function getFileHashes(rootPath: string, files: string[]): { [file: string]: string } {
  const foundFiles = gitListFiles(rootPath, files);
  const hashes = gitHashObject(rootPath, foundFiles);
  return Object.assign(
    {},
    ...foundFiles.map((fileName: string, index: number) => ({
      [fileName]: hashes[index],
    })),
  );
}

/**
 * Given a list of files, this:
 *  - filters the list for existence
 *  - then returns an array of modified timestamps as strings
 *
 * Note that in rough profiling on Windows this routine took ~0.5ms vs ~100ms for getFileHashes
 * for the same set of files.
 *
 * @param rootPath - root path to search for files in
 * @param files - list of files to query, note that this does not accept globs
 */
export function queryTimestamps(rootPath: string, files: string[]): string[] {
  return files
    .map(file => path.join(rootPath, file))
    .filter(filePath => fs.existsSync(filePath))
    .map(existingFile => String(fs.statSync(existingFile).mtimeMs));
}

/**
 * Get a cheap hash key for the repository structure.  Note that this is mainly for information
 * that only changes when things like the lock file, lerna.json, rush.json are modified
 *
 * @param rootPath - root of the repo
 */
export function getRepoHashKey(rootPath: string): string {
  return queryTimestamps(rootPath, [
    'shrinkwrap.yml',
    'package-lock.json',
    'yarn.lock',
    'pnpmfile.js',
    'rush.json',
    'lerna.json',
  ]).join('-');
}

/**
 * Get a standard path for just cache files
 *
 * @param fileName - file name for the cache file
 * @param useRoot - if true will find the repo root, if false or omitted will work from the current working directory
 */
export function getCachePath(fileName: string, useRoot?: boolean): string {
  const basePath = useRoot ? getRepoInfo().rootPath : process.cwd();
  return path.join(basePath, 'node_modules/.just', fileName);
}
