import fse from 'fs-extra';
import path from 'path';
import { upgradeStackPackageJsonFile } from './upgradeStackTask';
import { findMonoRepoRootPath } from '../package/findMonoRepoRootPath';

export async function upgradeRepoTask() {
  const rootPath = findMonoRepoRootPath();

  if (rootPath) {
    process.chdir(rootPath);
    const rushConfig = fse.readJsonSync(path.join(rootPath, 'rush.json'));

    // uses Array.reduce to sequentially loop through promise
    rushConfig.projects.reduce(async (previousPromise: Promise<void>, project: any) => {
      await previousPromise;
      const projectPath = path.join(rootPath, project.projectFolder);
      return upgradeStackPackageJsonFile(projectPath);
    }, Promise.resolve());
  }
}
