import * as fs from 'fs';
import * as path from 'path';
import { resolveCwd } from '../resolve';
import { findPackageRoot } from './findPackageRoot';
import { logger, mark } from '../logger';
import { findGitRoot } from './findGitRoot';
import { isChildOf } from '../paths';

interface DepInfo {
  name: string;
  path: string;
}

export function findDependents(): Set<DepInfo> {
  mark('cache:findDependents');
  const results = collectAllDependentPaths(findPackageRoot());
  logger.perf('cache:findDependents');
  return results;
}

function getDepsPaths(pkgPath: string): DepInfo[] {
  const gitRoot = findGitRoot();
  const packageJsonFile = path.join(pkgPath, 'package.json');

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFile).toString());

    let deps: string[] = [];
    deps = [
      ...deps,
      ...(packageJson.dependencies ? Object.keys(packageJson.dependencies) : []),
      ...(packageJson.devDependencies ? Object.keys(packageJson.devDependencies) : []),
    ];

    return deps
      .map(dep => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const depPackageJson = resolveCwd(path.join(dep, 'package.json'))!;

        if (!depPackageJson) {
          return null;
        }

        return { name: dep, path: path.dirname(fs.realpathSync(depPackageJson)) };
      })
      .filter(p => p && p.path.indexOf('node_modules') === -1 && isChildOf(p.path, gitRoot)) as DepInfo[];
  } catch (e) {
    logger.error(`Invalid package.json detected at ${packageJsonFile} `, e);
    return [];
  }
}

function collectAllDependentPaths(pkgPath: string, collected: Set<DepInfo> = new Set<DepInfo>()) {
  mark(`collectAllDependentPaths:${pkgPath}`);

  const depPaths = getDepsPaths(pkgPath);
  depPaths.forEach(depPath => collected.add(depPath));

  for (const depPath of depPaths) {
    if (!collected.has(depPath)) {
      collectAllDependentPaths(depPath.path, collected);
    }
  }

  logger.perf(`collectAllDependentPaths:${pkgPath}`);

  return collected;
}
