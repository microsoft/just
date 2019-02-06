import fse from 'fs-extra';
import path from 'path';
import { upgradeStackPackageJsonFile } from './upgradeStackTask';
import {
  findMonoRepoRootPath,
  rushUpdate,
  readRushJson,
  readPackageJson,
  logger
} from 'just-scripts-utils';
import { getOutdatedStacks } from '../monorepo/getOutdatedStacks';
import { argv } from 'just-task';

interface IUpgradeRepoTaskOptions {
  latest: boolean;
}

export async function upgradeRepoTask() {
  const rootPath = findMonoRepoRootPath();
  if (!rootPath) {
    logger.error('Could not find monorepo root path. Not upgrading anything.');
    return;
  }

  const scriptsPath = path.join(rootPath, 'scripts');
  const scriptsPackageJsonPath = path.join(scriptsPath, 'package.json');
  const scriptsPackageJson = readPackageJson(scriptsPath);
  if (!scriptsPackageJson) {
    logger.error(`Could not read ${scriptsPackageJsonPath}. Not upgrading anything.`);
    return;
  }

  const options: IUpgradeRepoTaskOptions = {
    latest: argv().latest
  };

  process.chdir(rootPath);
  const outdatedStacks = await getOutdatedStacks(rootPath);

  outdatedStacks.forEach(stack => {
    const { dependencies = {}, devDependencies = {} } = scriptsPackageJson;
    if (devDependencies[stack.name]) {
      devDependencies[stack.name] = options.latest ? `^${stack.latest}` : `^${stack.wanted}`;
    } else if (dependencies[stack.name]) {
      dependencies[stack.name] = options.latest ? `^${stack.latest}` : `^${stack.wanted}`;
    }
  });

  fse.writeJsonSync(scriptsPackageJsonPath, scriptsPackageJson, { spaces: 2 });

  rushUpdate(rootPath);

  const rushConfig = readRushJson(rootPath);

  for (const project of rushConfig.projects) {
    const projectPath = path.join(rootPath, project.projectFolder);
    await upgradeStackPackageJsonFile(projectPath, path.join(scriptsPath, 'node_modules'));
  }
}
