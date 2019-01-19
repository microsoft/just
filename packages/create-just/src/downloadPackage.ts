import { spawnSync } from 'child_process';
import { paths } from './paths';
import os from 'os';
import fse from 'fs-extra';
import tar from 'tar';
import path from 'path';

export async function downloadPackage(pkg: string) {
  const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
  const { tempPath } = paths;

  const pkgPath = tempPath(pkg);

  if (fse.existsSync(pkgPath)) {
    fse.removeSync(pkgPath);
  }

  fse.mkdirpSync(pkgPath);
  spawnSync(npmCmd, ['pack', pkg], { cwd: pkgPath });
  const files = fse.readdirSync(pkgPath);
  const pkgFile = files.find(file => file.endsWith('tgz') || file.endsWith('tar.gz'));

  if (pkgFile) {
    await tar.x({
      file: path.join(pkgPath, pkgFile),
      cwd: pkgPath
    });
    return path.join(pkgPath, 'package', 'template');
  }

  return null;
}
