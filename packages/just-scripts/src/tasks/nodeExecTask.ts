import { SpawnOptions } from 'child_process';
import { spawn } from '../utils';
import { logger, TaskFunction } from 'just-task';
import { resolveCwd, _tryResolve } from 'just-task/lib/resolve';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';

export interface NodeExecTaskOptions {
  /**
   * Arguments to be passed into a spawn call, including the script path to execute.
   * The script path should be **absolute** to prevent unpredictable resolution.
   *
   * **WARNING: If `options.shell` is enabled, do not pass unsanitized user input as `args`.
   * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
   */
  args: string[];

  /**
   * Environment variables to be passed to the spawned process
   */
  env?: NodeJS.ProcessEnv;

  /**
   * Whether to use `ts-node` to execute the script
   */
  enableTypeScript?: boolean;

  /**
   * tsconfig file path to pass to `ts-node`
   */
  tsconfig?: string;

  /**
   * Whether to use `transpileOnly` mode for `ts-node`
   */
  transpileOnly?: boolean;

  /**
   * Custom spawn options.
   *
   * **WARNING: If the `shell` option is enabled, do not pass unsanitized user input as `args`.
   * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
   */
  spawnOptions?: SpawnOptions;
}

export function nodeExecTask(options: NodeExecTaskOptions): TaskFunction {
  return function () {
    const { spawnOptions, enableTypeScript, tsconfig, transpileOnly } = options;

    const tsNodeRegister = resolveCwd('ts-node/register');
    const nodeExecPath = process.execPath;

    const args = [...(options.args || [])];
    const env = { ...options.env };
    const isTS = enableTypeScript && tsNodeRegister;

    if (isTS) {
      args.unshift(tsNodeRegister);
      args.unshift('-r');

      Object.assign(env, getTsNodeEnv(tsconfig, transpileOnly));
    }

    logger.info([`Executing${isTS ? ' [TS]' : ''}:`, nodeExecPath, ...args].join(' '));

    return spawn(nodeExecPath, args, { stdio: 'inherit', env, ...spawnOptions });
  };
}
