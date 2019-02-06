import { paths } from './paths';
import path from 'path';
import fse from 'fs-extra';
import { readPackageJson } from './readPackageJson';

/**
 * Find the path of a monorepo root relative to the project being generated/updated (as defined
 * by `paths.projectPath`, or defaulting to `process.cwd()`).
 *
 * This will be either the directory containing rush.json or the root of a package which uses
 * the `just-stack-monorepo` stack according to the `just.stack` property of its package.json.
 */
export function findMonoRepoRootPath(): string | null {
  const { projectPath } = paths;
  let found = false;
  let currentPath = projectPath;

  const { root } = path.parse(projectPath);

  while (!found && currentPath !== root) {
    const rushConfigFile = path.join(currentPath, 'rush.json');

    // Determine the monorepo by either presence of rush.json or package.json that has a just.stack of just-stack-monorepo
    if (fse.existsSync(rushConfigFile)) {
      return currentPath;
    }

    const packageJson = readPackageJson(currentPath);
    if (packageJson) {
      const stack = packageJson.just && packageJson.just.stack;
      if (stack === 'just-stack-monorepo') {
        return currentPath;
      }
    }

    currentPath = path.dirname(currentPath);
  }

  return null;
}
