import semver from 'semver';
import { IPackageJson } from './IPackageJson';

/**
 * Merges an incoming package.json with an original semantically
 * - merges dependencies and devDependencies for ranges that look like "^x.y.z" or "~x.y.z" or "x.y.z"
 *
 * @param original
 * @param incoming
 */
export function mergePackageJson(original: IPackageJson, incoming: IPackageJson): IPackageJson {
  if (!original.just) {
    return original;
  }

  // ensure the new package.json has deps and devDeps
  const newPackageJson: IPackageJson = { dependencies: {}, devDependencies: {}, ...original };

  const depTypes = ['dependencies', 'devDependencies'];
  let packageJsonModified = false;
  depTypes.forEach(depType => {
    const incomingDeps = incoming[depType] || {};
    const originalDeps = original[depType] || {};

    Object.keys(incomingDeps).forEach(dep => {
      const strippedOriginalVersion = (originalDeps[dep] || '0.0.0').replace(/^[~^]/, '');
      const strippedIncomingVersion = incomingDeps[dep].replace(/^[~^]/, '');

      // Modify the version if the range is comparable and is greater
      // (skip mod if any space, >, < or = characters are present)
      if (
        semver.gt(strippedIncomingVersion, strippedOriginalVersion) &&
        !/[\s<>=]/.test(incomingDeps[dep])
      ) {
        newPackageJson[depType][dep] = incomingDeps[dep];
        packageJsonModified = true;
      }
    });
  });

  return packageJsonModified ? newPackageJson : original;
}
