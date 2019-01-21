import fse from 'fs-extra';
import path from 'path';
import semver from 'semver';
import { logger } from 'just-task';
import { paths, downloadPackage, transform } from 'just-scripts-utils';

export async function upgradeStackTask() {
  const { installPath, tempPath } = paths;
  const packageJsonFile = path.join(installPath, 'package.json');
  const packageJson = fse.readJsonSync(packageJsonFile);

  if (packageJson.just) {
    const stack = packageJson.just.stack;
    const stackPath = await downloadPackage(stack);

    if (stackPath) {
      const templatePath = tempPath(packageJson.name);
      transform(stackPath, templatePath, { name: packageJson.name });
      // Update package.json deps
      const stackPackageJson = fse.readJsonSync(path.join(templatePath, 'package.json'));
      const depTypes = ['dependencies', 'devDependencies'];
      let packageJsonModified = false;
      depTypes.forEach(devType => {
        if (stackPackageJson[devType]) {
          Object.keys(stackPackageJson[devType]).forEach(dep => {
            const strippedPackageVersion = packageJson[devType][dep] ? packageJson[devType][dep].replace(/^[~^]/, '') : '0.0.0';
            const strippedStackPackageVersion = stackPackageJson[devType][dep].replace(/^[~^]/, '');

            if (semver.gt(strippedStackPackageVersion, strippedPackageVersion)) {
              logger.info(`Dependency ${dep} should be updated to ${stackPackageJson[devType][dep]}`);
              packageJson[devType][dep] = stackPackageJson[devType][dep];
              packageJsonModified = true;
            }
          });
        }
      });

      if (packageJsonModified) {
        fse.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2));
      }
    } else {
      logger.error(`Cannot read or retrieve the stack package.json for ${stack}`);
    }
  } else {
    logger.info(`Package ${packageJson} does not have a "just" key. Not self-upgradeable through this task.`);
  }
}
