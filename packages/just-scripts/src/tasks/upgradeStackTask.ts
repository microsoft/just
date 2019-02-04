import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { logger } from 'just-task';
import { paths, downloadPackage, transform, mergePackageJson } from 'just-scripts-utils';

export async function upgradeStackTask() {
  const { installPath } = paths;
  return upgradeStackPackageJsonFile(installPath);
}

/**
 * Updates the project according to the stack that is specified in the just.stack key in package.json
 * - if the templateInstallationPath is provided, use the installed template at that path
 * - otherwise, will download the latest and use that to update deps
 *
 * @param projectPath
 * @param templateInstallationPath
 */
export async function upgradeStackPackageJsonFile(projectPath: string, templateInstallationPath: string | null = null) {
  const packageJsonFile = path.join(projectPath, 'package.json');
  const packageJson = fse.readJsonSync(packageJsonFile);

  if (packageJson.just && packageJson.just.stack) {
    const stack = packageJson.just.stack;
    let stackPath: string | null = null;

    if (!templateInstallationPath) {
      stackPath = await downloadPackage(stack);
    } else {
      stackPath = path.join(templateInstallationPath, stack, 'template');
    }

    if (stackPath) {
      upgradePackageDeps(stackPath, packageJsonFile);
    } else {
      logger.error(`Cannot read or retrieve the stack package.json for ${stack}`);
    }
  } else {
    logger.info(`Package ${chalk.cyan(packageJson.name)} does not have a "just" key. Skipping upgrade.`);
  }
}

/**
 * Takes the installed or newly downloaded template and merge in the new package deps
 * @param stackPath
 * @param packageJsonFile
 */
function upgradePackageDeps(stackPath: string, packageJsonFile: string) {
  const packageJson = fse.readJsonSync(packageJsonFile);
  const { tempPath } = paths;
  const templatePath = tempPath(packageJson.name);
  transform(stackPath, templatePath, { name: packageJson.name });

  // Update package.json deps
  const stackPackageJson = fse.readJsonSync(path.join(templatePath, 'package.json'));

  // If modified, the reference would be different
  const newPackageJson = mergePackageJson(packageJson, stackPackageJson);

  logger.info(`Checking if package ${packageJson.name} should be upgraded...`);
  if (newPackageJson !== packageJson) {
    logger.info(`Package ${chalk.cyan(packageJson.name)} is being upgraded.`);
    fse.writeFileSync(packageJsonFile, JSON.stringify(newPackageJson, null, 2));
  } else {
    logger.info(`Package ${chalk.cyan(packageJson.name)} upgrade not needed.`);
  }
}
