import { PackageJson, PackageJsonLoader, RushProject } from '../interfaces/configTypes';
import { PackageEntries, PackageEntry, PackageInfo, PackageInfoOptions } from '../interfaces/packageInfoTypes';
import { getConfigLoader, readPackageJson } from '../readConfigs';
import { normalizeToUnixPath } from '../normalizeToUnixPath';
import * as path from 'path';
import * as glob from 'glob';

function buildPackageInfo(root: string, pkgPath: string, pkgJsonName?: string): PackageEntries {
  const pkgJsonPath = pkgJsonName ? path.join(root, pkgPath, pkgJsonName) : path.join(root, pkgPath);
  const getConfig = getConfigLoader<PackageJson>(pkgJsonPath) as PackageJsonLoader;
  return {
    [getConfig().name]: {
      path: normalizeToUnixPath(path.dirname(pkgJsonPath)),
      getConfig,
      dependencies: {},
    },
  };
}

function buildPackageInfoForGlob(root: string, pkgGlob: string): PackageEntries {
  const matchPattern = pkgGlob + '/package.json';
  const globOptions = { cwd: root, ignore: '**/node_modules/**' };
  return Object.assign(
    {} as PackageEntries,
    ...glob.sync(matchPattern, globOptions).map(subPath => buildPackageInfo(root, subPath)),
  );
}

function addPackageDependencyBranch(repoInfo: PackageEntries, pkg: PackageEntry, key: string): void {
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

function addPackageDependencies(info: PackageEntries): void {
  Object.keys(info).forEach(pkg => {
    addPackageDependencyBranch(info, info[pkg], 'dependencies');
    addPackageDependencyBranch(info, info[pkg], 'devDependencies');
  });
}

export function buildPackageInfoFromGlobs(root: string, globs: string[]): PackageEntries {
  const results: PackageEntries = Object.assign({}, ...globs.map(glob => buildPackageInfoForGlob(root, glob)));
  addPackageDependencies(results);
  return results;
}

export function buildPackageInfoFromRushProjects(root: string, projects: RushProject[]): PackageEntries {
  const results: PackageEntries = Object.assign(
    {},
    ...projects.map(project => buildPackageInfo(root, project.projectFolder, 'package.json')),
  );
  addPackageDependencies(results);
  return results;
}

function findRecursiveDependencies(
  collector: PackageEntries,
  entry: PackageEntry,
  depType?: PackageInfoOptions['dependencyType'],
): void {
  const dependencies = entry.dependencies;
  Object.keys(dependencies).forEach(dep => {
    if (!collector[dep]) {
      const configDeps = depType && entry.getConfig()[depType];
      if (!depType || (configDeps && configDeps[dep])) {
        collector[dep] = dependencies[dep];
        findRecursiveDependencies(collector, dependencies[dep], depType);
      }
    }
  });
}

export function infoFromEntries(entries: PackageEntries): PackageInfo {
  return {
    paths: () => Object.keys(entries).map(pkgName => normalizeToUnixPath(entries[pkgName].path)),
    names: () => Object.keys(entries),
    dependencies: (options?: PackageInfoOptions) => {
      const target = (options && options.target) || readPackageJson(process.cwd())!.name;
      const baseEntry = entries[target];
      const collector: PackageEntries = {};
      if (baseEntry) {
        findRecursiveDependencies(collector, baseEntry, options ? options.dependencyType : undefined);
      }
      return infoFromEntries(collector);
    },
    entries,
  };
}
