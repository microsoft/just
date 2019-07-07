import { readPackageJson, logger } from 'just-scripts-utils';
import { TaskFunction } from 'just-task';
import { writeLockFile } from '../stack/lockfile';
import { getStackDiffs } from '../stack/getStackDiffs';
import { applyStackDiffs } from '../stack/applyStackDiffs';
import { getResolvedStackVersions } from '../stack/getResolvedStackVersions';

/**
 * @returns TaskFunction
 */
export function upgradeStackTask(): TaskFunction {
  return async function upgradeStack() {
    const rootPath = process.cwd();

    const resolvedStacks = getResolvedStackVersions(rootPath);
    const stackDiffs = await getStackDiffs(rootPath, resolvedStacks);

    if (stackDiffs) {
      let didUpgradeProjects = false;

      // Second, apply patch
      const projPackageJson = readPackageJson(rootPath);

      if (projPackageJson && projPackageJson.just && projPackageJson.just.stack) {
        const diffInfo = stackDiffs[projPackageJson.just.stack];

        // no diff info means that there isn't any diffs to apply
        if (diffInfo) {
          logger.info(
            `Upgrading ${projPackageJson.name} from ${projPackageJson.just.stack} v${diffInfo.fromVersion} to v${diffInfo.toVersion}`
          );

          applyStackDiffs(rootPath, stackDiffs[projPackageJson.just.stack]);

          didUpgradeProjects = true;
        }
      }

      if (didUpgradeProjects) {
        logger.info('Upgrade stack task has finished its work. You might notice some conflicts to be resolved by hand.');
      }
    }

    logger.info('Writing just-stacks.json. Please check this file in!');
    writeLockFile(rootPath, resolvedStacks);
  };
}
