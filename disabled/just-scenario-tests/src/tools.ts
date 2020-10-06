import { spawnSync } from './spawnSync';
import * as path from 'path';
import * as os from 'os';

export function runNpm(args: string[], tmpPath: string) {
  const npmPath = path.join(path.dirname(process.execPath), os.platform() === 'win32' ? 'npm.cmd' : 'npm');
  return spawnSync(npmPath, args, { cwd: tmpPath });
}

export function runNode(args: string[], tmpPath: string) {
  return spawnSync(process.execPath, args, { cwd: tmpPath });
}
