import { spawnSync } from 'child_process';
import { getEnvInfo } from './getEnvInfo';

function getYarn() {
  const yarnInfo = getEnvInfo().Binaries.Yarn;
  return yarnInfo && yarnInfo.path;
}

function getNpm() {
  const npmInfo = getEnvInfo().Binaries.npm;
  return npmInfo && npmInfo.path;
}

export function install(registry: string, cwd: string) {
  const registryArgs = registry ? ['--registry', registry] : [];

  if (getYarn()) {
    return spawnSync(getYarn(), ['install', ...registryArgs], { stdio: 'inherit', cwd });
  } else {
    return spawnSync(getNpm(), ['install', ...registryArgs], { stdio: 'inherit', cwd });
  }
}
