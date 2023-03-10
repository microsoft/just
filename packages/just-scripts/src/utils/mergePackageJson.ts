import { PackageJson } from '../interfaces/PackageJson';
import semver = require('semver');

/**
 * Merges an incoming package.json with an original semantically. It can only handle merging
 * dependencies and devDependencies for ranges that look like "^x.y.z" or "~x.y.z" or "x.y.z".
 *
 * @param original Original package.json contents.
 * @param incoming Incoming package.json contents.
 * @returns Returns a new package.json object if any changes were needed, or returns `original`
 * if not. (You can tell if changes were made by checking the object identity.)
 */
export function mergePackageJson(original: PackageJson, incoming: PackageJson): PackageJson {
  if (!original.just) {
    return original;
  }

  // deep copy the deps and devDeps
  const newPackageJson: PackageJson = {
    ...original,
    dependencies: { ...(original.dependencies || {}) },
    devDependencies: { ...(original.devDependencies || {}) },
  };

  const depTypes = ['dependencies', 'devDependencies'];
  let packageJsonModified = false;
  depTypes.forEach(depType => {
    const incomingDeps = incoming[depType] || {};
    const originalDeps = original[depType] || {};

    Object.keys(incomingDeps).forEach(dep => {
      // TODO: should this handle deleting deps that exist in originalDeps but not incomingDeps?
      if (_shouldUpdateDep(originalDeps[dep], incomingDeps[dep])) {
        newPackageJson[depType][dep] = incomingDeps[dep];
        packageJsonModified = true;
      }
    });
  });

  return packageJsonModified ? newPackageJson : original;
}

/**
 * Exported for testing only. Determines whether a dep should be updated.
 * Returns false if either version includes semver elements we don't understand
 * (any characters besides number and ~ ^).
 * @param originalVersion The original dep version (default 0.0.0)
 * @param incomingVersion The incoming dep version
 */
export function _shouldUpdateDep(originalVersion: string | undefined, incomingVersion: string): boolean {
  const strippedOriginalVersion = (originalVersion || '0.0.0').replace(/^[~^]/, '');
  const strippedIncomingVersion = incomingVersion.replace(/^[~^]/, '');

  // semver.valid only returns true for a valid SINGLE version, not any type of range
  if (!semver.valid(strippedOriginalVersion) || !semver.valid(strippedIncomingVersion)) {
    // The original and/or incoming versions (with ~ and ^ removed) can't be understood as a single
    // semver version. They might be valid ranges of some other form (like with x or ||), but we
    // don't currently handle those. Do nothing.
    return false;
  }

  // Modify the version if the range is comparable and is greater
  return semver.gt(strippedIncomingVersion, strippedOriginalVersion);
}
