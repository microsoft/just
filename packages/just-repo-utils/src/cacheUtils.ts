import { gitListFiles, gitHashObject } from './gitUtils';
import { repoInfo } from './repoInfo';
import path from 'path';

export const lockFiles = ['shrinkwrap.yml', 'package-lock.json', 'yarn.lock', 'pnpmfile.js'];
export const projectFiles = ['rush.json', 'lerna.json'];

export function getFileHashes(rootPath: string, files: string[]): { [file: string]: string } {
  const foundFiles = gitListFiles(rootPath, files);
  const hashes = gitHashObject(rootPath, foundFiles);
  return Object.assign({}, ...foundFiles.map((fileName: string, index: number) => ({
    [fileName]: hashes[index]
  })));
}

export function getRepoHashKey(rootPath: string): string {
  const hashes = gitHashObject(rootPath, gitListFiles(rootPath, [...lockFiles, ...projectFiles]));
  return hashes.join('-');
}

export function getCachePath(fileName: string, useRoot?: boolean): string {
  const basePath = useRoot ? repoInfo().rootPath : process.cwd();
  return path.join(basePath, 'node_modules/.just', fileName);
}