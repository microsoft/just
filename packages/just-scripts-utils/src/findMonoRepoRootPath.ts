import { paths } from './paths';
import path from 'path';
import fse from 'fs-extra';

export function findMonoRepoRootPath() {
  const { installPath } = paths;
  let found = false;
  let currentPath = installPath;

  const { root } = path.parse(installPath);

  while (!found && currentPath !== root) {
    const packageJsonFile = path.join(currentPath, 'package.json');
    const rushConfigFile = path.join(currentPath, 'rush.json');

    // Determine the monorepo by either presence of rush.json or package.json that has a just.stack of just-stack-monorepo
    if (fse.existsSync(rushConfigFile)) {
      return currentPath;
    }

    if (fse.existsSync(packageJsonFile)) {
      const packageJson = fse.readJsonSync(packageJsonFile);
      const stack = packageJson.just && packageJson.just.stack;
      if (stack === 'just-stack-monorepo') {
        return currentPath;
      }
    }

    currentPath = path.dirname(currentPath);
  }

  return null;
}
