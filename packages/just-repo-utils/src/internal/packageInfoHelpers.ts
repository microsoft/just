import { PackageJson, PackageJsonLoader, RushProject } from '../interfaces/configTypes';
import { PackageEntries, PackageEntry, PackageInfo } from '../interfaces/packageInfoTypes';
import { getConfigLoader, readPackageJson } from '../readConfigs';
import { normalizeToUnixPath } from '../normalizeToUnixPath';
import path from 'path';
import glob from 'glob';

function buildPackageInfo(root: string, pkgPath: string, pkgJsonName?: string): PackageEntries {
  const pkgJsonPath = pkgJsonName ? path.join(root, pkgPath, pkgJsonName) : path.join(root, pkgPath);
  const getConfig = getConfigLoader<PackageJson>(pkgJsonPath) as PackageJsonLoader;
  return {
    [getConfig().name]: {
      path: normalizeToUnixPath(path.dirname(pkgJsonPath)),
      getConfig,
      dependencies: {}
    }
  };
}

function buildPackageInfoForGlob(root: string, pkgGlob: string): PackageEntries {
  const matchPattern = pkgGlob + '/package.json';
  const globOptions = { cwd: root, ignore: '**/node_modules/**' };
  return Object.assign({}, ...glob.sync(matchPattern, globOptions).map(subPath => buildPackageInfo(root, subPath)));
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
    ...projects.map(project => buildPackageInfo(root, project.projectFolder, 'package.json'))
  );
  addPackageDependencies(results);
  return results;
}

function addRecursiveDependencies(collector: PackageEntries, entry: PackageEntry): void {
  const dependencies = entry.dependencies;
  Object.keys(dependencies).forEach(dep => {
    if (!collector[dep]) {
      collector[dep] = dependencies[dep];
      addRecursiveDependencies(collector, dependencies[dep]);
    }
  });
}

export function infoFromEntries(entries: PackageEntries): PackageInfo {
  return {
    paths: () => Object.keys(entries).map(pkgName => normalizeToUnixPath(entries[pkgName].path)),
    names: () => Object.keys(entries),
    dependencies: (target?: string) => {
      target = target || readPackageJson(process.cwd())!.name;
      const baseEntry = entries[target];
      const collector: PackageEntries = {};
      if (baseEntry) {
        addRecursiveDependencies(collector, baseEntry);
      }
      return infoFromEntries(collector);
    },
    entries
  };
}
