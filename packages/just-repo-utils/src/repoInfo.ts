import { getConfigLoader, loadCJson } from './readConfigs';
import { LernaJson, RushJson, PackageJson } from './interfaces/configTypes';
import { RepoInfo } from './interfaces/repoInfoTypes';
import path from 'path';
import fse from 'fs-extra';

let _repoInfo: RepoInfo | undefined = undefined;

/**
 * Finds the root of the git repository, i.e. where .git resides
 *
 * @param cb - callback function to execute at each level.  A true result for the callback will
 * cancel the walk and return the current path at the time it was cancelled.
 */
export function findGitRoot(cb?: (current: string) => boolean | void): string {
  let cwd = process.cwd();
  const root = path.parse(cwd).root;

  while (cwd !== root) {
    if ((cb && cb(cwd)) || fse.existsSync(path.join(cwd, '.git'))) {
      return cwd;
    }
    cwd = path.dirname(cwd);
  }
  throw 'No repository root found!';
}

/**
 * Retrieve info for the repository.  This will walk up from the current working directory
 * until it finds the git root and then prepare loaders for various monorepo config files.
 *
 * Note that this uses in-module caching to avoid traversing unnecessarily.
 */
export function getRepoInfo(): RepoInfo {
  if (_repoInfo) {
    return _repoInfo;
  }

  const rootPath = findGitRoot();
  const getRushJson = getConfigLoader<RushJson>(rootPath, 'rush.json', loadCJson);
  const getLernaJson = getConfigLoader<LernaJson>(rootPath, 'lerna.json');
  const isMonoRepo = getRushJson || getLernaJson;
  _repoInfo = {
    rootPath: rootPath,
    getRushJson,
    getLernaJson,
    getPackageJson: getConfigLoader<PackageJson>(rootPath, 'package.json')!,
    ...(isMonoRepo && { monorepo: getRushJson ? 'rush' : 'lerna' })
  };
  return _repoInfo;
}
