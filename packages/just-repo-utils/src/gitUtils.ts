import { spawnSync } from 'child_process';
import { repoInfo } from './repoInfo';

function cleanGitStdout(stdout: Buffer): string[] {
  return stdout
    .toString()
    .split(/\n/)
    .map(l => l.trim())
    .filter(v => v);
}

export function findGitRoot(): string {
  return repoInfo().rootPath;
}

export function gitListFiles(root: string | undefined, scope: string[]): string[] {
  root = root || findGitRoot();
  scope = scope || [];
  const lsResults = spawnSync('git', ['ls-files', ...scope], { cwd: root });
  return lsResults.status !== 0 ? [] : cleanGitStdout(lsResults.stdout);
}

export function gitHashObject(root: string | undefined, files: string[]): string[] {
  root = root || findGitRoot();
  const hashResults = spawnSync('git', ['hash-object', ...files], { cwd: root });
  return hashResults.status !== 0 ? [] : cleanGitStdout(hashResults.stdout);
}
