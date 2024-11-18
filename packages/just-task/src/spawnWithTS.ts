import { SpawnOptions } from 'child_process';
import * as fse from 'fs-extra';
import { logger, spawn } from 'just-scripts-utils';
import { resolve } from './resolve';

export type TSExecutor = 'ts-node' | 'ts-node-esm' | 'tsx';

/**
 * Run something with a TS executor.
 * @internal Exported for use by `just-scripts` only.
 */
export function _spawnWithTS(params: {
  cmd: string;
  args?: ReadonlyArray<string>;
  opts?: SpawnOptions;
  /**
   * TS executor to use, or order of preference to check for.
   * Defaults to `['ts-node', 'tsx']` for compatibility.
   */
  executor?: TSExecutor | TSExecutor[];
}): Promise<void> {
  const { cmd, opts = {}, executor = ['ts-node', 'tsx'] } = params;

  const checkExecutors = typeof executor === 'string' ? [executor] : executor;
  let executorBin: string | undefined;
  for (const executor of checkExecutors) {
    const packageJsonPath = resolve(`${executor === 'ts-node-esm' ? 'ts-node' : executor}/package.json`);
    if (!packageJsonPath) {
      continue;
    }
    const packageJson = fse.readJsonSync(packageJsonPath) as { bin: string | Record<string, string> };
    const binPath = typeof packageJson.bin === 'string' ? packageJson.bin : packageJson.bin[executor];
    if (binPath) {
      executorBin = binPath;
      break;
    }
  }

  if (!executorBin) {
    throw new Error(`Could not find ${checkExecutors.join(' or ')}`);
  }

  const args = [executorBin, cmd, ...(params.args || [])];
  logger.info('Executing [TS]:', process.execPath, args.join(' '));

  return spawn(process.execPath, args, {
    stdio: 'inherit',
    ...opts,
    env: {
      ...opts.env,
      JUST_TASK_TS: 'true',
    },
  });
}
