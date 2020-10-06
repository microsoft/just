import { spawnSync } from 'child_process';
import { getEnvInfo } from './getEnvInfo';
import { existsSync, writeFileSync } from 'fs';
import * as path from 'path';

export function getYarn() {
  const yarnInfo = getEnvInfo().Binaries.Yarn;
  return yarnInfo && yarnInfo.path;
}

function getNpm() {
  const npmInfo = getEnvInfo().Binaries.npm;
  return npmInfo && npmInfo.path;
}

export function ensureNpmrcIfRequired(registry: string, cwd: string) {
  const npmrcPath = path.join(cwd, '.npmrc');
  // If a custom registry is specified, add an .npmrc file, that forces auth
  if (registry && !existsSync(npmrcPath)) {
    writeFileSync(
      npmrcPath,
      `registry=${registry}
${registry}:always-auth=true`
    );
  }
}

export function install(registry: string, cwd: string) {
  const registryArgs = registry ? ['--registry', registry] : [];

  if (getYarn()) {
    return spawnSync(getYarn(), ['install', ...registryArgs], { stdio: 'inherit', cwd });
  } else {
    return spawnSync(getNpm(), ['install', ...registryArgs], { stdio: 'inherit', cwd });
  }
}
