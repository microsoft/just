import cp, { SpawnSyncOptions } from 'child_process';

export function spawnSync(cmd: string, args: string[], options: SpawnSyncOptions) {
  const results = cp.spawnSync(cmd, args, options);
  return results.stdout.toString() + results.stderr.toString();
}
