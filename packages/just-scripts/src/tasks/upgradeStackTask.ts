import fse from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { logger } from 'just-task';
import {
  paths,
  downloadPackage,
  applyTemplate,
  mergePackageJson,
  readPackageJson,
  IPackageJson
} from 'just-scripts-utils';
import { TaskFunction } from 'just-task/lib/task';

export function upgradeStackTask(): TaskFunction {
  const { projectPath } = paths;
  return function upgradeStack() {
    upgradeStackPackageJsonFile(projectPath);
  };
}

/**
 * Updates the project according to the stack that is specified in the just.stack key in package.json
 * - if the templateInstallationPath is provided, use the installed template at that path
 * - otherwise, will download the latest and use that to update deps
 *
 * @param projectPath
 * @param templateInstallationPath
 */
export async function upgradeStackPackageJsonFile(
  projectPath: string,
  templateInstallationPath?: string
): Promise<void> {
  const packageJson = readPackageJson(projectPath);

  if (packageJson && packageJson.just && packageJson.just.stack) {
    const stack = packageJson.just.stack;
    let stackPath: string | null = null;

    if (!templateInstallationPath) {
      stackPath = await downloadPackage(stack);
    } else {
      stackPath = path.join(templateInstallationPath, stack, 'template');
    }

    if (stackPath) {
      upgradePackageDeps(stackPath, projectPath, packageJson);
    } else {
      logger.error(`Cannot read or retrieve the stack package.json for ${stack}`);
    }
  } else if (packageJson) {
    logger.info(
      `Package ${chalk.cyan(packageJson.name)} does not have a "just" key. Skipping upgrade.`
    );
  } else {
    logger.info(`package.json not found under ${chalk.cyan(projectPath)}. Skipping upgrade.`);
  }
}

/**
 * Takes the installed or newly downloaded template and merge in the new package deps
 */
function upgradePackageDeps(stackPath: string, projectPath: string, packageJson: IPackageJson) {
  const templatePath = paths.tempPath(packageJson.name);
  applyTemplate(stackPath, templatePath, { name: packageJson.name });

  // Update package.json deps
  const stackPackageJson = readPackageJson(templatePath);
  if (!stackPackageJson) {
    logger.error(`Cannot find or read stack's package.json under ${stackPath}`);
    return;
  }

  const newPackageJson = mergePackageJson(packageJson, stackPackageJson);

  // If modified, the reference would be different
  logger.info(`Checking if package ${packageJson.name} should be upgraded...`);
  if (newPackageJson !== packageJson) {
    logger.info(`Package ${chalk.cyan(packageJson.name)} is being upgraded.`);
    fse.writeJsonSync(path.join(projectPath, 'package.json'), newPackageJson, { spaces: 2 });
  } else {
    logger.info(`Package ${chalk.cyan(packageJson.name)} upgrade not needed.`);
  }
}
