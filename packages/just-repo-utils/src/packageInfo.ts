import { PackageInfo, PackageEntry, PackageInfoOptions } from './interfaces/packageInfoTypes';
import { repoInfo } from './repoInfo';
import { PackageJson, PackageJsonLoader, RushProject } from './interfaces/configTypes';
import { getConfigLoader, readPackageJson } from './readConfigs';
import { normalizePath } from './normalizePath';
import path from 'path';
import glob from 'glob';
import { retrievePackageInfo, cachePackageInfo } from './packageInfoCache';

function buildPackageInfo(root: string, pkgPath: string, pkgJsonName?: string): PackageInfo {
  const pkgJsonPath = pkgJsonName ? path.join(root, pkgPath, pkgJsonName) : path.join(root, pkgPath);
  const getConfig = getConfigLoader<PackageJson>(pkgJsonPath) as PackageJsonLoader;
  return {
    [getConfig().name]: {
      path: normalizePath(path.dirname(pkgJsonPath)),
      getConfig,
      dependencies: {}
    }
  };
}

function buildPackageInfoForGlob(root: string, pkgGlob: string): PackageInfo {
  const matchPattern = pkgGlob + '/package.json';
  const globOptions = { cwd: root, ignore: '**/node_modules/**' };
  return Object.assign({}, ...glob.sync(matchPattern, globOptions).map(subPath => buildPackageInfo(root, subPath)));
}

function addPackageDependencyBranch(repoInfo: PackageInfo, pkg: PackageEntry, key: string): void {
  const config = pkg.getConfig();
  const section = config[key];
  const dependencies = pkg.dependencies;
  if (section) {
    Object.keys(section).forEach(dependency => {
      if (repoInfo[dependency] && !dependencies[dependency]) {
        dependencies[dependency] = repoInfo[dependency];
      }
    });
  }
}

function addPackageDependencies(info: PackageInfo): void {
  Object.keys(info).forEach(pkg => {
    addPackageDependencyBranch(info, info[pkg], 'dependencies');
    addPackageDependencyBranch(info, info[pkg], 'devDependencies');
  })
}

function buildPackageInfoFromGlobs(root: string, globs: string[]): PackageInfo {
  const results: PackageInfo = Object.assign({}, ...globs.map(glob => buildPackageInfoForGlob(root, glob)));
  addPackageDependencies(results);
  return results;
}

function buidlPackageInfoFromRushProjects(root: string, projects: RushProject[]): PackageInfo {
  const results: PackageInfo = Object.assign({}, ...projects.map(project => buildPackageInfo(root, project.projectFolder, 'package.json')));
  addPackageDependencies(results);
  return results;
}

/**
 * retrieves information about the packages in the repository
 * @param strategy - cache strategy to use for loading, defaults to normal
 */
export function getPackageInfo(options?: PackageInfoOptions): PackageInfo {
  const { strategy = 'normal' } = options || {};
  let repoPackageInfo = strategy === 'normal' && retrievePackageInfo();
  if (!repoPackageInfo) {
    const repo = repoInfo();
    if (repo.getLernaJson) {
      repoPackageInfo = buildPackageInfoFromGlobs(repo.rootPath, repo.getLernaJson().packages);
    } else if (repo.getRushJson) {
      repoPackageInfo = buidlPackageInfoFromRushProjects(repo.rootPath, repo.getRushJson().projects);
    }
    if (strategy !== 'no-cache' && repoPackageInfo) {
      cachePackageInfo(repoPackageInfo);
    }
  }
  return repoPackageInfo || {};
}

function packageInfoToPaths(info: PackageInfo): string[] {
  return Object.keys(info).map(pkgName => normalizePath(info[pkgName].path));
}

/**
 * Get the name of all packages that are part of this repo
 * @param options - standard package info options
 */
export function getRepoPackageNames(options?: PackageInfoOptions): string[] {
  return Object.keys(getPackageInfo(options));
}

/**
 * Get paths for all packages that are part of this repo
 * @param options - standard package info options
 */
export function getRepoPackagePaths(options?: PackageInfoOptions): string[] {
  return packageInfoToPaths(getPackageInfo(options));
}

function addRecursiveDependencies(collector: PackageInfo, entry: PackageEntry): void {
  const dependencies = entry.dependencies;
  Object.keys(dependencies).forEach(dep => {
    if (!collector[dep]) {
      collector[dep] = dependencies[dep];
      addRecursiveDependencies(collector, dependencies[dep]);
    }
  });
}

function getDependentPackageEntries(options?: PackageInfoOptions): PackageInfo {
  const target = options && options.target || readPackageJson(process.cwd())!.name;
  const baseEntry = getPackageInfo(options)[target];
  const collector: PackageInfo = {};
  if (baseEntry) {
    addRecursiveDependencies(collector, baseEntry);
  }
  return collector;
}

/**
 * return a list of dependent packages for the package in the current working directory
 * @param options - options for caching and targeting a package by name
 */
export function getDependentPackageNames(options?: PackageInfoOptions): string[] {
  return Object.keys(getDependentPackageEntries(options));
}

/**
 * return a list of dependent package paths for the package in the current working directory
 * @param options - options for caching and targeting a package by name
 */
export function getDependentPackagePaths(options?: PackageInfoOptions): string[] {
  return packageInfoToPaths(getDependentPackageEntries(options));
}
