import cp, { SpawnSyncOptions } from 'child_process';
import { tmpPath } from './tmpPath';

export function spawnSync(cmd: string, args: string[], options: SpawnSyncOptions) {
  const results = cp.spawnSync(cmd, args, { ...options, cwd: tmpPath });
  return results.stdout.toString() + results.stderr.toString();
}
