import fse from 'fs-extra';
import path from 'path';
import semver from 'semver';
import { logger } from 'just-task';
import { downloadPackage } from 'just-scripts-utils';

export async function upgradeStackTask() {
  const cwd = process.cwd();
  const packageJson = fse.readJsonSync(path.join(cwd, 'package.json'));

  if (packageJson.just) {
    const stack = packageJson.just.stack;
    const stackPath = await downloadPackage(stack);
    if (stackPath) {
      // Update package.json deps
      const stackPackageJson = fse.readJsonSync(stackPath);
      const depTypes = ['dependencies', 'devDependencies'];
      depTypes.forEach(devType => {
        if (stackPackageJson[devType]) {
          Object.keys(stackPackageJson[devType]).forEach(dep => {
            const strippedPackageVersion = packageJson[devType][dep] ? packageJson[devType][dep].replace(/^[~^]/, '') : '0.0.0';
            const strippedStackPackageVersion = stackPackageJson[devType][dep].replace(/^[~^]/, '');

            if (semver.gt(strippedStackPackageVersion, strippedPackageVersion)) {
              packageJson[devType][dep] = stackPackageJson[devType][dep];
            }
          });
        }
      });
    } else {
      logger.error(`Cannot read or retrieve the stack package.json for ${stack}`);
    }
  } else {
    logger.info(`Package ${packageJson} does not have a "just" key. Not self-upgradeable through this task.`);
  }
}
