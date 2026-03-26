import { SpawnOptions } from 'child_process';
import { spawn } from '../utils';
import { logger, TaskFunction } from 'just-task';

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
    const { spawnOptions } = options;

    const nodeExecPath = process.execPath;

    const args = [...(options.args || [])];
    //  Preserve the default behavior of inheriting process.env if no options are specified
    const env = options.env ? { ...options.env } : { ...process.env };

    logger.info(['Executing:', nodeExecPath, ...args].join(' '));

    return spawn(nodeExecPath, args, { stdio: 'inherit', env, ...spawnOptions });
  };
}
