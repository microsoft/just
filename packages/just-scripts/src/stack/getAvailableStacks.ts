import path from 'path';
import { readPackageJson } from 'just-scripts-utils';

export function getAvailableStacks(rootPath: string) {
  const scriptsPath = path.join(rootPath, 'scripts');
  const packageJson = readPackageJson(path.join(rootPath, 'scripts'));

  if (!packageJson) {
    throw new Error(`not able to read package.json from ${scriptsPath}`);
  }

  const devDeps = packageJson.devDependencies || {};

  const stackDeps = Object.keys(devDeps).reduce<{ [key: string]: string }>((collected, dep) => {
    const depPackageJson = readPackageJson(dep)!;
    if (
      dep.includes('just-stack') ||
      (depPackageJson.keywords && depPackageJson.keywords.includes('just-stack'))
    ) {
      return { ...collected, [dep]: devDeps[dep] };
    }

    return collected;
  }, {});

  return stackDeps;
}
