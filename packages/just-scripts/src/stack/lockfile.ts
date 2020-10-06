import * as path from 'path';
import * as fs from 'fs';
import { StackVersions } from './StackVersions';

export function writeLockFile(rootPath: string, resolvedStacks: StackVersions) {
  const lockFile = path.join(rootPath, 'just-stacks.json');
  fs.writeFileSync(lockFile, JSON.stringify({ stacks: resolvedStacks }, null, 2));
}

export function readLockFile(rootPath: string) {
  const lockFile = path.join(rootPath, 'just-stacks.json');
  if (!fs.existsSync(lockFile)) {
    return null;
  }

  const lockFileObject = JSON.parse(fs.readFileSync(lockFile).toString());
  return lockFileObject && lockFileObject.stacks ? lockFileObject.stacks : null;
}
