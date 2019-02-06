import { spawnSync } from 'child_process';
import { paths } from './paths';
import os from 'os';
import fse from 'fs-extra';
import tar from 'tar';
import path from 'path';
import { readPackageJson } from './readPackageJson';

function isDevMode(pkg: string) {
  const projectPackageJson = readPackageJson(path.join(__dirname, '../../..'));
  if (projectPackageJson && fse.existsSync(path.join(__dirname, '../..', pkg))) {
    return projectPackageJson.name === 'just-task';
  }
}

export async function downloadPackage(pkg: string, version: string = 'latest') {
  const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
  const { tempPath } = paths;

  const pkgPath = tempPath(pkg);

  if (fse.existsSync(pkgPath)) {
    fse.removeSync(pkgPath);
  }

  if (isDevMode(pkg)) {
    return path.join(__dirname, '../../', pkg, 'template');
  }

  fse.mkdirpSync(pkgPath);
  spawnSync(npmCmd, ['pack', `${pkg}@${version}`, '--no-cache'], { cwd: pkgPath });
  const files = fse.readdirSync(pkgPath);
  const pkgFile = files.find(file => file.endsWith('tgz'));

  if (pkgFile) {
    await tar.x({
      file: path.join(pkgPath, pkgFile),
      cwd: pkgPath
    });
    return path.join(pkgPath, 'package', 'template');
  }

  return null;
}
