import { getConfigLoader, loadCJson } from './readConfigs';
import { LernaJson, RushJson, PackageJson, PackageJsonLoader } from './interfaces/configTypes';
import { RepoInfo, FindRootCallback, RepoInfoOptions } from './interfaces/repoInfoTypes';
import * as path from 'path';
import * as fse from 'fs-extra';

let _repoInfo: RepoInfo | undefined = undefined;

/**
 * A more comprehensive check for repo root.  This will check the just section of package.json to
 * see if this has been flagged as a root or if it is using the monorepo stack.  It will also check
 * for rush.json or lerna.json.  Any of these should be treated as the repository root.
 *
 * @param cwd - current working directory to test
 * @param loader - loader function for
 */
function isRepoRoot(cwd: string, config?: PackageJson): boolean | undefined {
  const just = config && config.just;
  const isRootFromJust = just && (just.root || (just.stack && just.stack === 'just-stack-monorepo'));
  const isRootFromMonorepoConfigs = config && (fse.existsSync(path.join(cwd, 'rush.json')) || fse.existsSync(path.join(cwd, 'lerna.json')));
  return isRootFromJust || isRootFromMonorepoConfigs;
}

/**
 * Finds the root of the git repository, i.e. where .git resides
 *
 * @param cb - callback function to execute at each level.  A true result for the callback will
 * cancel the walk and return the current path at the time it was cancelled.
 */
export function findGitRoot(cb?: FindRootCallback, options?: RepoInfoOptions): string {
  let cwd = (options && options.cwd) || process.cwd();
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
 * helper for finding the repository root that also returns the package loader so that it can be
 * retained for use later.
 *
 * @param cb - standard findGitRoot/findRepoRoot callback
 */
function findRepoRootWithConfig(cb?: FindRootCallback, options?: RepoInfoOptions): [string, PackageJsonLoader | undefined] {
  let loader: PackageJsonLoader | undefined = undefined;
  const path = findGitRoot(cwd => {
    loader = getConfigLoader<PackageJson>(cwd, 'package.json');
    return (cb && cb(cwd)) || isRepoRoot(cwd, loader && loader());
  }, options);
  return [path, loader];
}

/**
 * Finds the root of the repository, will handle various end conditions such as git root,
 * rush/lerna config existence, or certain just settings in package.json
 *
 * @param cb - callback function of the same type as for findGitRoot
 */
export function findRepoRoot(cb?: FindRootCallback, options?: RepoInfoOptions): string {
  return findRepoRootWithConfig(cb, options)[0];
}

/**
 * Retrieve info for the repository.  This will walk up from the current working directory
 * until it finds the git root and then prepare loaders for various monorepo config files.
 *
 * Note that this uses in-module caching to avoid traversing unnecessarily.
 */
export function getRepoInfo(options?: RepoInfoOptions): RepoInfo {
  if (_repoInfo && (!options || !options.cwd)) {
    return _repoInfo;
  }

  const [rootPath, packageLoader] = findRepoRootWithConfig(undefined, options);
  const getRushJson = getConfigLoader<RushJson>(rootPath, 'rush.json', loadCJson);
  const getLernaJson = getConfigLoader<LernaJson>(rootPath, 'lerna.json');
  const isMonoRepo = getRushJson || getLernaJson;
  _repoInfo = {
    rootPath: rootPath,
    getRushJson,
    getLernaJson,
    getPackageJson: packageLoader!,
    ...(isMonoRepo && { monorepo: getRushJson ? 'rush' : 'lerna' }),
  };
  return _repoInfo;
}
