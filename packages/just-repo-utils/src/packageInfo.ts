import { PackageInfoOptions, PackageInfo } from './interfaces/packageInfoTypes';
import { getRepoInfo } from './repoInfo';

function validateOptions(options?: PackageInfoOptions): PackageInfoOptions {
  options = options || {};
  // if a current working directory is being specified the primary use case is querying dependencies or packages of a different
  // repository.  In this case, any information retrieved shouldn't be stored in our cache as it may or may not be relevant
  if (options.cwd) {
    options.strategy = 'no-cache';
  }
  return options;
}

/**
 * retrieves information about the packages in the repository
 * @param strategy - cache strategy to use for loading, defaults to normal
 */
export function getPackageInfo(options?: PackageInfoOptions): PackageInfo {
  options = validateOptions(options);
  const { retrievePackageInfo, cachePackageInfo } = require('./internal/packageInfoCache');
  const { infoFromEntries, buildPackageInfoFromGlobs, buildPackageInfoFromRushProjects } = require('./internal/packageInfoHelpers');
  const { strategy = 'normal' } = options;
  let repoPackageInfo = strategy === 'normal' && retrievePackageInfo();
  if (!repoPackageInfo) {
    const repo = getRepoInfo(options);
    if (repo.getLernaJson) {
      repoPackageInfo = buildPackageInfoFromGlobs(repo.rootPath, repo.getLernaJson().packages);
    } else if (repo.getRushJson) {
      repoPackageInfo = buildPackageInfoFromRushProjects(repo.rootPath, repo.getRushJson().projects);
    }
    if (strategy !== 'no-cache' && repoPackageInfo) {
      cachePackageInfo(repoPackageInfo);
    }
  }
  return infoFromEntries(repoPackageInfo || {});
}

export function getDependentPackageInfo(options?: PackageInfoOptions): PackageInfo {
  options = options || {};
  return getPackageInfo(options).dependencies(options);
}
