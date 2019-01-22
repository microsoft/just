import semver from 'semver';

/**
 * Merges an incoming package.json with an original semantically
 * - merges dependencies and devDependencies for ranges that look like "^x.y.z" or "~x.y.z" or "x.y.z"
 *
 * @param original
 * @param incoming
 */
export function mergePackageJson(original: any, incoming: any) {
  const newPackageJson = { ...original };

  if (original.just) {
    const depTypes = ['dependencies', 'devDependencies'];
    let packageJsonModified = false;
    depTypes.forEach(devType => {
      if (incoming[devType]) {
        Object.keys(incoming[devType]).forEach(dep => {
          const strippedOriginalVersion = original[devType][dep] ? original[devType][dep].replace(/^[~^]/, '') : '0.0.0';
          const strippedIncomingVersion = incoming[devType][dep].replace(/^[~^]/, '');

          // Modify the version if the range is comparable and is greater (skip mod if any space, >, < or = characters are present)
          if (semver.gt(strippedIncomingVersion, strippedOriginalVersion) && !incoming[devType][dep].match(/[\s<>=]/)) {
            newPackageJson[devType][dep] = incoming[devType][dep];
            packageJsonModified = true;
          }
        });
      }
    });

    if (packageJsonModified) {
      return newPackageJson;
    }
  }

  return original;
}
