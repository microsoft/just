import { getAvailableStacks } from './getAvailableStacks';
import path from 'path';
import fs from 'fs';
import { readPackageJson } from 'just-scripts-utils';
import { resolve } from 'just-task';

export function writeLockFile(rootPath: string) {
  const stacks = getAvailableStacks(rootPath);

  const resolvedStacks: { [key: string]: string } = {};
  Object.keys(stacks).forEach(stack => {
    const packageJsonPath = resolve(stack + '/package.json', path.join(rootPath, 'scripts'));

    if (packageJsonPath) {
      const packageJson = readPackageJson(path.dirname(packageJsonPath));

      if (packageJson) {
        resolvedStacks[stack] = packageJson.version;
      }
    }
  });

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
