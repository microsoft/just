import { spawnSync } from 'child_process';
import { paths } from './paths';
import os from 'os';
import fse from 'fs-extra';
import tar from 'tar';
import path from 'path';
import { readPackageJson } from './readPackageJson';
import { logger } from './logger';

let dirname: string = '';
/** For testing purposes only. */
export function _setMockDirname(dir: string): void {
  dirname = dir;
}

/**
 * True if the package path exists and the command is being run within the just-task monorepo.
 * @param pkg Package path
 */
export function _isDevMode(pkg: string): boolean {
  const projectPackageJson = readPackageJson(path.join(dirname || __dirname, '../../..'));
  if (projectPackageJson && fse.existsSync(path.join(dirname || __dirname, '../..', pkg))) {
    return projectPackageJson.name === 'just-repo';
  }
  return false;
}

/**
 * Downloads a copy of a package containing just templates into the temp folder and returns
 * the path to the template folder within the package. (If this is used within the just-task
 * monorepo and `pkg` is the name of a package under the `packages` folder, it will return
 * the local path rather than downloading anything.)
 *
 * @param pkg Package name/partial path to download.
 * @param version Version of the package to download.
 * @returns The path to the template folder within the package.
 */
export async function downloadPackage(pkg: string, version: string = 'latest', registry: string | null = null): Promise<string | null> {
  if (_isDevMode(pkg) && version === 'latest') {
    return path.join(dirname || __dirname, '../../', pkg, 'template');
  }

  const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';

  const pkgPath = paths.tempPath(pkg, version);

  if (fse.existsSync(pkgPath)) {
    fse.removeSync(pkgPath);
  }

  fse.mkdirpSync(pkgPath);
  const result = spawnSync(npmCmd, ['pack', `${pkg}@${version}`, '--no-cache', ...(registry ? ['--registry', registry] : [])], {
    cwd: pkgPath
  });

  if (result.error) {
    logger.error('Error fetching package');
    logger.error(result.error);
    return null;
  }

  const files = fse.readdirSync(pkgPath);
  const pkgFile = files.find(file => file.endsWith('tgz'));

  if (pkgFile) {
    await tar.extract({
      file: path.join(pkgPath, pkgFile),
      cwd: pkgPath
    });
    return path.join(pkgPath, 'package', 'template');
  } else {
    logger.error(`Could not find downloaded tgz file ${pkgPath}`);
    return null;
  }
}
