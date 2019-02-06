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

  const rushConfig = readRushJson(rootPath);
  if (!rushConfig) {
    logger.error(`Could not read rush.json under ${rootPath}. Not upgrading anything.`);
    return;
  }

  process.chdir(rootPath);
  const outdatedStacks = await getOutdatedStacks(rootPath);
  const latest = argv().latest;

  outdatedStacks.forEach(stack => {
    const { dependencies = {}, devDependencies = {} } = scriptsPackageJson;
    if (devDependencies[stack.name]) {
      devDependencies[stack.name] = latest ? `^${stack.latest}` : `^${stack.wanted}`;
    } else if (dependencies[stack.name]) {
      dependencies[stack.name] = latest ? `^${stack.latest}` : `^${stack.wanted}`;
    }
  });

  fse.writeJsonSync(scriptsPackageJsonPath, scriptsPackageJson, { spaces: 2 });

  rushUpdate(rootPath);

  let promise = Promise.resolve();
  for (const project of rushConfig.projects) {
    const projectPath = path.join(rootPath, project.projectFolder);
    promise = promise.then(() =>
      upgradeStackPackageJsonFile(projectPath, path.join(scriptsPath, 'node_modules'))
    );
  }
  return promise;
}
