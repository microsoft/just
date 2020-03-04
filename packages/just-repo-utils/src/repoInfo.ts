import { getConfigLoader, loadCJson } from './readConfigs';
import { LernaJson, RushJson, PackageJson } from './interfaces/configTypes';
import { RepoInfo } from './interfaces/repoInfoTypes';
import path from 'path';
import fse from 'fs-extra';

let _repoInfo: RepoInfo | undefined = undefined;

/**
 * Retrieve info for the repository.  This will walk up from the current working directory
 * until it finds a lerna.json, rush.json, or the git root.
 */
export function repoInfo(): RepoInfo {
  if (_repoInfo) {
    return _repoInfo;
  }

  let cwd = process.cwd();
  const root = path.parse(cwd).root;
  while (cwd !== root) {
    // walk up to the git root
    if (fse.existsSync(path.join(cwd, '.git'))) {
      const getRushJson = getConfigLoader<RushJson>(cwd, 'rush.json', loadCJson);
      const getLernaJson = getConfigLoader<LernaJson>(cwd, 'lerna.json');
      const isMonoRepo = getRushJson || getLernaJson;
      _repoInfo = {
        rootPath: cwd,
        getRushJson,
        getLernaJson,
        getPackageJson: getConfigLoader<PackageJson>(cwd, 'package.json')!,
        ...(isMonoRepo && { monorepo: getRushJson ? 'rush' : 'lerna' })
      }
      return _repoInfo;
    }
    cwd = path.dirname(cwd);
  }
  throw ('No repository root found!');
}