import { getAvailableStacks } from './getAvailableStacks';
import path from 'path';
import fs from 'fs';

export function writeLockFile(rootPath: string) {
  const stacks = getAvailableStacks(rootPath);
  const lockFile = path.join(rootPath, 'scripts', 'just-stacks.json');
  fs.writeFileSync(lockFile, JSON.stringify({ stacks }, null, 2));
}

export function readLockFile(rootPath: string) {
  const lockFile = path.join(rootPath, 'scripts', 'just-stacks.json');
  if (!fs.existsSync(lockFile)) {
    return null;
  }

  const lockFileObject = JSON.parse(fs.readFileSync(lockFile).toString());

  return lockFileObject && lockFileObject.stacks ? lockFileObject.stacks : null;
}
