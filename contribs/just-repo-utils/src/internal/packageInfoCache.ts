import { getRepoInfo } from '../repoInfo';
import { getRepoHashKey, getCachePath } from '../cacheUtils';
import { PackageEntries } from '../interfaces/packageInfoTypes';
import { getConfigLoader, readJsonConfig } from '../readConfigs';
import { PackageJson, PackageJsonLoader } from '../interfaces/configTypes';
import * as fs from 'fs-extra';
import * as path from 'path';

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

/**
 * @private only exposed for testing
 */
export function getSerializableRepoPackages(info: PackageEntries): ISerializableRepoPackages {
  const results: ISerializableRepoPackages = {};
  Object.keys(info).forEach(pkgName => {
    results[pkgName] = {
      path: info[pkgName].path,
      dependencies: Object.keys(info[pkgName].dependencies)
    };
  });
  return results;
}

/**
 * @private only exposed for testing
 */
export function getRepoPackagesFromSerializableForm(info: ISerializableRepoPackages): PackageEntries {
  const results: PackageEntries = {};
  // build the initial set
  Object.keys(info).forEach(pkgName => {
    const entry = info[pkgName];
    results[pkgName] = {
      path: entry.path,
      getConfig: getConfigLoader<PackageJson>(entry.path, 'package.json') as PackageJsonLoader,
      dependencies: {}
    };
  });
  // now link dependencies
  Object.keys(info).forEach(pkgName => {
    const dependencies = results[pkgName].dependencies;
    info[pkgName].dependencies.forEach(pkg => {
      dependencies[pkg] = results[pkg];
    });
  });
  return results;
}

/**
 * this saves the loaded package info into a JSON cache file
 * @param pkgInfo - package info to save in a cache file
 */
export function cachePackageInfo(pkgInfo: PackageEntries): void {
  const repo = getRepoInfo();
  const toJson: IPackageInfoCacheJson = {
    hash: getRepoHashKey(repo.rootPath),
    packages: getSerializableRepoPackages(pkgInfo)
  };
  // ensure the directory is created
  const cacheDir = path.dirname(cachePath);
  if (!fs.pathExistsSync(cacheDir)) {
    fs.mkdirpSync(cacheDir);
  }
  // now write out the cache file
  fs.writeFileSync(cachePath, JSON.stringify(toJson, null, 2));
}

/**
 * this attempts to load package info from a JSON cache file
 */
export function retrievePackageInfo(): PackageEntries | undefined {
  const repo = getRepoInfo();
  const jsonData = readJsonConfig<IPackageInfoCacheJson>(cachePath);
  if (jsonData && jsonData.hash == getRepoHashKey(repo.rootPath)) {
    return getRepoPackagesFromSerializableForm(jsonData.packages);
  }
  return undefined;
}
