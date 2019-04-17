import { getAvailableStacks } from './getAvailableStacks';
import { resolve } from 'just-task';
import { readPackageJson } from 'just-scripts-utils';
import path from 'path';

/**
 * Get resolved stack versions, for monorepo, pass in the /scripts, for others, pass in the rootPath
 * @param stackInstallpath
 */
export function getResolvedStackVersions(stackInstallpath: string) {
  const stacks = getAvailableStacks(stackInstallpath);
  const resolvedStacks: { [key: string]: string } = {};

  Object.keys(stacks).forEach(stack => {
    const packageJsonPath = resolve(stack + '/package.json', stackInstallpath);

    if (packageJsonPath) {
      const packageJson = readPackageJson(path.dirname(packageJsonPath));

      if (packageJson) {
        resolvedStacks[stack] = packageJson.version;
      }
    }
  });

  return resolvedStacks;
}
