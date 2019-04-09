import {
  findMonoRepoRootPath,
  rushUpdate,
  readRushJson,
  readPackageJson,
  logger
} from 'just-scripts-utils';
import { TaskFunction } from 'just-task';
import { getAvailableStacks } from '../stack/getAvailableStacks';
import { readLockFile, writeLockFile } from '../stack/lockfile';
import { getStackDiffs } from '../monorepo/getStackDiffs';
import { DiffInfo } from '../monorepo/DiffInfo';
import { applyStackDiffs } from '../monorepo/applyStackDiffs';

export function upgradeRepoTask(): TaskFunction {
  return async function upgradeRepo() {
    const rootPath = findMonoRepoRootPath();
    if (!rootPath) {
      logger.error('Could not find monorepo root path. Not upgrading anything.');
      return;
    }

    const oldStacks = readLockFile(rootPath);

    if (oldStacks) {
      // First, gather all the stack diffs
      const newStacks = getAvailableStacks(rootPath);
      const stackDiffs: { [stack: string]: DiffInfo } = {};

      try {
        await Object.keys(oldStacks).reduce((currentPromise, stack) => {
          if (oldStacks[stack] !== newStacks[stack]) {
            return currentPromise.then(async () => {
              stackDiffs[stack] = await getStackDiffs(stack, oldStacks[stack], newStacks[stack]);
            });
          }

          return currentPromise;
        }, Promise.resolve());
      } catch (e) {
        logger.error('Cannot figure out upgrades needed for the packages in this repo');
      }

      // Second, for each package, look for stacks that match
      const rushConfig = readRushJson(rootPath);
      if (!rushConfig) {
        logger.error(`Could not read rush.json under ${rootPath}. Not upgrading anything.`);
        return;
      }

      await rushConfig.projects.reduce(async (currentPromise, project) => {
        const projPackageJson = readPackageJson(project.projectFolder);

        if (projPackageJson && projPackageJson.just && projPackageJson.just.stack) {
          await currentPromise;

          const diffInfo = stackDiffs[projPackageJson.just.stack];

          logger.info(
            `Upgrading ${project.packageName} from ${projPackageJson.just.stack} v${
              diffInfo.fromVersion
            } to v${diffInfo.toVersion}`
          );

          applyStackDiffs(project.projectFolder, stackDiffs[projPackageJson.just.stack]);
        }
      }, Promise.resolve());
    }

    rushUpdate(rootPath);

    logger.info('Writing just-stacks.json. Please check this file in!');
    writeLockFile(rootPath);

    logger.info(
      'Upgrade repo task has finished its work. You might notice some conflicts to be resolved by hand.'
    );
  };
}
