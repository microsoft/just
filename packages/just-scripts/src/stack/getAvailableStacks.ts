import { readPackageJson } from 'just-scripts-utils';

export function getAvailableStacks(rootPath: string) {
  const packageJson = readPackageJson(rootPath);

  if (!packageJson) {
    throw new Error(`not able to read package.json from ${rootPath}`);
  }

  let stackDeps: { [key: string]: string } = {};

  const devDeps = packageJson.devDependencies || {};

  Object.keys(devDeps).forEach(dep => {
    const depPackageJson = readPackageJson(dep)!;
    if (dep.includes('just-stack') || (depPackageJson.keywords && depPackageJson.keywords.includes('just-stack'))) {
      stackDeps[dep] = devDeps[dep];
    }
  });

  return stackDeps;
}
