import fse from 'fs-extra';
import path from 'path';
import { upgradeStackPackageJsonFile } from './upgradeStackTask';
import {
  findMonoRepoRootPath,
  rushUpdate,
  readRushJson,
  readPackageJson
} from 'just-scripts-utils';
import { getOutdatedStacks } from '../monorepo/getOutdatedStacks';
import { argv } from 'just-task';

export interface UpgradeRepoTaskOptions {
  latest: boolean;
}

export async function upgradeRepoTask() {
  const options: UpgradeRepoTaskOptions = {
    latest: argv().latest
  };

  const rootPath = findMonoRepoRootPath();

  if (rootPath) {
    process.chdir(rootPath);
    const scriptsPath = path.join(rootPath, 'scripts');
    const scriptsPackageJson = readPackageJson(scriptsPath)!;
    const outdatedStacks = await getOutdatedStacks(rootPath);

    outdatedStacks.forEach(stack => {
      if (scriptsPackageJson.devDependencies![stack.name]) {
        scriptsPackageJson.devDependencies![stack.name] = options.latest
          ? `^${stack.latest}`
          : `^${stack.wanted}`;
      } else if (scriptsPackageJson.dependencies![stack.name]) {
        scriptsPackageJson.dependencies![stack.name] = options.latest
          ? `^${stack.latest}`
          : `^${stack.wanted}`;
      }
    });

    fse.writeJsonSync(path.join(scriptsPath, 'package.json'), scriptsPackageJson, { spaces: 2 });

    rushUpdate(rootPath);

    const rushConfig = readRushJson(rootPath);

    // uses Array.reduce to sequentially loop through promise
    rushConfig.projects.reduce(async (previousPromise: Promise<void>, project: any) => {
      await previousPromise;
      const projectPath = path.join(rootPath, project.projectFolder);
      return upgradeStackPackageJsonFile(projectPath, path.join(scriptsPath, 'node_modules'));
    }, Promise.resolve());
  }
}
