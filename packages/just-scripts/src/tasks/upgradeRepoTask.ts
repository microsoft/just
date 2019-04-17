import { findMonoRepoRootPath, readRushJson, readPackageJson, logger } from 'just-scripts-utils';
import path from 'path';
import { TaskFunction } from 'just-task';
import { writeLockFile } from '../stack/lockfile';
import { getStackDiffs } from '../stack/getStackDiffs';
import { applyStackDiffs } from '../stack/applyStackDiffs';
import { getResolvedStackVersions } from '../stack/getResolvedStackVersions';

export function upgradeRepoTask(): TaskFunction {
  return async function upgradeRepo() {
    const rootPath = findMonoRepoRootPath();

    if (!rootPath) {
      logger.error('Could not find monorepo root path. Not upgrading anything.');
      return;
    }

    const resolveStacks = getResolvedStackVersions(path.join(rootPath, 'scripts'));
    const stackDiffs = await getStackDiffs(rootPath, resolveStacks);

    if (stackDiffs) {
      let didUpgradeProjects = false;

      // For each package, look for stacks that match, and apply upgrade for the project
      const rushConfig = readRushJson(rootPath);
      if (!rushConfig) {
        logger.error(`Could not read rush.json under ${rootPath}. Not upgrading anything.`);
        return;
      }

      await rushConfig.projects.reduce(async (currentPromise, project) => {
        await currentPromise;

        if (project.projectFolder !== 'scripts') {
          const projPackageJson = readPackageJson(path.join(rootPath, project.projectFolder));

          if (projPackageJson && projPackageJson.just && projPackageJson.just.stack) {
            const diffInfo = stackDiffs[projPackageJson.just.stack];

            // no diff info means that there isn't any diffs to apply
            if (diffInfo) {
              logger.info(
                `Upgrading ${project.packageName} from ${projPackageJson.just.stack} v${diffInfo.fromVersion} to v${diffInfo.toVersion}`
              );

              applyStackDiffs(path.join(rootPath, project.projectFolder), stackDiffs[projPackageJson.just.stack]);

              didUpgradeProjects = true;
            }
          }
        }
      }, Promise.resolve());

      if (didUpgradeProjects) {
        logger.info('Upgrade repo task has finished its work. You might notice some conflicts to be resolved by hand.');
        logger.info('You might also have to perform a `rush update` manually if package.json has been modified by the upgrade');
      }
    }

    logger.info('Writing just-stacks.json. Please check this file in!');
    writeLockFile(rootPath, resolveStacks);
  };
}
