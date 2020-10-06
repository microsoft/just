import { readPackageJson } from 'just-scripts-utils';
import * as path from 'path';

export function getAvailableStacks(rootPath: string) {
  const packageJson = readPackageJson(rootPath);

  if (!packageJson) {
    throw new Error(`not able to read package.json from ${rootPath}`);
  }

  const stackDeps: { [key: string]: string } = {};

  const devDeps = packageJson.devDependencies || {};
  Object.keys(devDeps).forEach(dep => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const depPackageJson = readPackageJson(path.join(rootPath, 'node_modules', dep))!;
    if (dep.includes('just-stack') || (depPackageJson && depPackageJson.keywords && depPackageJson.keywords.includes('just-stack'))) {
      stackDeps[dep] = devDeps[dep];
    }
  });

  return stackDeps;
}
