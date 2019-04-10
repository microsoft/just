import { getAvailableStacks } from './getAvailableStacks';
import path from 'path';
import fs from 'fs';
import { readPackageJson } from 'just-scripts-utils';

export function writeLockFile(rootPath: string) {
  const stacks = getAvailableStacks(rootPath);

  const resolvedStacks: { [key: string]: string } = {};
  Object.keys(stacks).forEach(stack => {
    const packageJson = readPackageJson(path.join(stack, 'package.json'));
    if (packageJson) {
      resolvedStacks[stack] = packageJson.version;
    }
  });

  const lockFile = path.join(rootPath, 'scripts', 'just-stacks.json');
  fs.writeFileSync(lockFile, JSON.stringify({ stacks: resolvedStacks }, null, 2));
}

export function readLockFile(rootPath: string) {
  const lockFile = path.join(rootPath, 'scripts', 'just-stacks.json');
  if (!fs.existsSync(lockFile)) {
    return null;
  }

  const lockFileObject = JSON.parse(fs.readFileSync(lockFile).toString());

  return lockFileObject && lockFileObject.stacks ? lockFileObject.stacks : null;
}
