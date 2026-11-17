import { logger, type TaskFunction } from 'just-task';
import type { Options as SpawnOptions } from 'nano-spawn';

export interface NodeExecTaskOptions {
  /**
   * Arguments to be passed into a `nano-spawn` call, including the script path to execute.
   * The script path should be **absolute** to prevent unpredictable resolution.
   *
   * **WARNING: If `options.shell` is enabled, do not pass unsanitized user input as `args`.
   * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
   */
  args: string[];

  /**
   * Environment variables to be passed to the spawned process (merged with `process.env`).
   */
  env?: NodeJS.ProcessEnv;

  /**
   * Custom options to pass to `nano-spawn`.
   *
   * **WARNING: If the `shell` option is enabled, do not pass unsanitized user input as `args`.
   * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
   */
  spawnOptions?: SpawnOptions;
}

/**
 * Create a task to execute a command in a new process.
 * Uses `nano-spawn` for better handling of quoting/escaping and cross-platform consistency.
 *
 * **WARNING: If the `shell` option is enabled, do not pass unsanitized user input to this task.
 * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
 */
export function nodeExecTask(options: NodeExecTaskOptions): TaskFunction {
  return async function () {
    const { spawnOptions } = options;
    const nodeExecPath = process.execPath;

    const args = [...(options.args || [])];
    const env = options.env ? { ...options.env } : { ...process.env };

    logger.info(['Executing:', nodeExecPath, ...args].join(' '));

    const nanoSpawn = (await import('nano-spawn')).default;
    await nanoSpawn(nodeExecPath, args, { stdio: 'inherit', env, ...spawnOptions });
  };
}
