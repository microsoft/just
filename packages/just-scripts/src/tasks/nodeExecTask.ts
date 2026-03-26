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
   * Environment variables to be passed to the spawned process.
   * Defaults to `process.env`.
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

/**
 * Create a task to execute a command in a new process.
 * Uses `cross-spawn` to avoid issues with spaces in arguments, but does not do any additional escaping.
 *
 * **WARNING: If the `shell` option is enabled, do not pass unsanitized user input to this task.
 * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
 */
export function nodeExecTask(options: NodeExecTaskOptions): TaskFunction {
  return function () {
    const { spawnOptions, enableTypeScript, tsconfig, transpileOnly } = options;

    const tsNodeRegister = resolveCwd('ts-node/register');
    const nodeExecPath = process.execPath;

    const args = [...(options.args || [])];
    //  Preserve the default behavior of inheriting process.env if no options are specified
    let env = options.env ? { ...options.env } : { ...process.env };
    const isTS = enableTypeScript && tsNodeRegister;

    if (isTS) {
      args.unshift('-r', tsNodeRegister);

      env = { ...env, ...getTsNodeEnv(tsconfig, transpileOnly) };
    }

    logger.info([`Executing${isTS ? ' [TS]' : ''}:`, nodeExecPath, ...args].join(' '));

    return spawn(nodeExecPath, args, { stdio: 'inherit', env, ...spawnOptions });
  };
}
