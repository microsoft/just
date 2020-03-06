import { PackageInfoOptions, PackageInfo } from './interfaces/packageInfoTypes';
import { getRepoInfo } from './repoInfo';

/**
 * retrieves information about the packages in the repository
 * @param strategy - cache strategy to use for loading, defaults to normal
 */
export function getPackageInfo(options?: PackageInfoOptions): PackageInfo {
  const { retrievePackageInfo, cachePackageInfo } = require('./internal/packageInfoCache');
  const { infoFromEntries, buildPackageInfoFromGlobs, buildPackageInfoFromRushProjects } = require('./internal/packageInfoHelpers');
  const { strategy = 'normal' } = options || {};
  let repoPackageInfo = strategy === 'normal' && retrievePackageInfo();
  if (!repoPackageInfo) {
    const repo = getRepoInfo();
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
  return getPackageInfo(options).dependencies(options.target);
}
