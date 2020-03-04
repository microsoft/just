import { repoInfo } from './repoInfo';
import { getRepoHashKey, getCachePath } from './cacheUtils';
import { PackageInfo } from './interfaces/packageInfoTypes';
import { getConfigLoader, readJsonConfig } from './readConfigs';
import { PackageJson, PackageJsonLoader } from './interfaces/configTypes';
import fs from 'fs-extra';

interface ISerializablePackageEntry {
  path: string;
  dependencies: string[];
}

interface ISerializableRepoPackages {
  [key: string]: ISerializablePackageEntry;
}

interface IPackageInfoCacheJson {
  hash: string;
  packages: ISerializableRepoPackages;
}

const cacheFileName = 'package-info.json';
const cachePath = getCachePath(cacheFileName, true);

function getSerializableRepoPackages(info: PackageInfo): ISerializableRepoPackages {
  const results: ISerializableRepoPackages = {};
  Object.keys(info).forEach(pkgName => {
    results[pkgName] = {
      path: info[pkgName].path,
      dependencies: Object.keys(info[pkgName].dependencies)
    }
  });
  return results;
}

function getRepoPackagesFromSerializableForm(info: ISerializableRepoPackages): PackageInfo {
  const results: PackageInfo = {};
  // build the initial set
  Object.keys(info).forEach(pkgName => {
    const entry = info[pkgName];
    results[pkgName] = {
      path: entry.path,
      getConfig: getConfigLoader<PackageJson>(entry.path, 'package.json') as PackageJsonLoader,
      dependencies: {}
    }
  });
  // now link dependencies
  Object.keys(info).forEach(pkgName => {
    const dependencies = results[pkgName].dependencies;
    info[pkgName].dependencies.forEach(pkg => {
      dependencies[pkg] = results[pkg];
    })
  });
  return results;
}

// local storage value for calling this multiple times in the same session
let _packageInfo: PackageInfo | undefined = undefined;

/**
 * this saves the loaded package info into a JSON cache file
 * @param pkgInfo - package info to save in a cache file
 */
export function cachePackageInfo(pkgInfo: PackageInfo): void {
  const repo = repoInfo();
  const toJson: IPackageInfoCacheJson = {
    hash: getRepoHashKey(repo.rootPath),
    packages: getSerializableRepoPackages(pkgInfo)
  }
  fs.writeFileSync(cachePath, JSON.stringify(toJson, null, 2));
  _packageInfo = pkgInfo;
}

/**
 * this attempts to load package info from a JSON cache file
 */
export function retrievePackageInfo(): PackageInfo | undefined {
  if (_packageInfo) {
    return _packageInfo;
  }

  const repo = repoInfo();
  const jsonData = readJsonConfig<IPackageInfoCacheJson>(cachePath);
  if (jsonData && jsonData.hash == getRepoHashKey(repo.rootPath)) {
    return getRepoPackagesFromSerializableForm(jsonData.packages);
  }
  return undefined;
}
