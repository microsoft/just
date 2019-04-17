import { readPackageJson } from 'just-scripts-utils';
import path from 'path';

export function getAvailableStacks(rootPath: string) {
  const packageJson = readPackageJson(rootPath);

  if (!packageJson) {
    throw new Error(`not able to read package.json from ${rootPath}`);
  }

  let stackDeps: { [key: string]: string } = {};

  const devDeps = packageJson.devDependencies || {};
  Object.keys(devDeps).forEach(dep => {
    const depPackageJson = readPackageJson(path.join(rootPath, 'node_modules', dep))!;
    if (dep.includes('just-stack') || (depPackageJson && depPackageJson.keywords && depPackageJson.keywords.includes('just-stack'))) {
      stackDeps[dep] = devDeps[dep];
    }
  });

  return stackDeps;
}
