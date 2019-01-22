import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { logger } from 'just-task';
import { paths, downloadPackage, transform, mergePackageJson } from 'just-scripts-utils';

export function upgradeStackTask() {
  const { installPath } = paths;
  return upgradeStackPackageJsonFile(installPath);
}

export async function upgradeStackPackageJsonFile(projectPath: string) {
  const packageJsonFile = path.join(projectPath, 'package.json');
  const packageJson = fse.readJsonSync(packageJsonFile);
  const { tempPath } = paths;

  if (packageJson.just) {
    const stack = packageJson.just.stack;
    const stackPath = await downloadPackage(stack);

    if (stackPath) {
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
    } else {
      logger.error(`Cannot read or retrieve the stack package.json for ${stack}`);
    }
  } else {
    logger.info(`Package ${chalk.cyan(packageJson.name)} does not have a "just" key. Skipping upgrade.`);
  }
}
