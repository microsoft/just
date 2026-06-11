import execa from 'execa';
import { logger, type TaskFunction } from 'just-task';
import { resolveWrapper } from '../tryRequire';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';

export interface NodeExecTaskOptions {
  /**
   * Arguments to be passed into a `execa` call, including the script path to execute.
   * The script path should be **absolute** to prevent unpredictable resolution.
   *
   * **WARNING: If `options.shell` is enabled, do not pass unsanitized user input as `args`.
   * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
   */
  args: string[];

  /**
   * Environment variables to be passed to the spawned process.
   * Defaults to `process.env`.
   * (To preserve the original `process.env`, spread it along with your custom env.)
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
   * Custom options to pass to `execa`.
   *
   * **WARNING: If the `shell` option is enabled, do not pass unsanitized user input as `args`.
   * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
   */
  spawnOptions?: execa.Options;
}

/**
 * Create a task to execute a command in a new process.
 * Uses `execa` for better handling of quoting/escaping and cross-platform consistency.
 *
 * **WARNING: If the `shell` option is enabled, do not pass unsanitized user input to this task.
 * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
 */
export function nodeExecTask(options: NodeExecTaskOptions): TaskFunction {
  return async function () {
    const { spawnOptions, enableTypeScript, tsconfig, transpileOnly } = options;

    const tsNodeRegister = enableTypeScript && resolveWrapper('ts-node/register');
    const nodeExecPath = process.execPath;

    const args = [...(options.args || [])];
    //  Preserve the default behavior of inheriting process.env if no options are specified
    let env = options.env ? { ...options.env } : { ...process.env };

    if (tsNodeRegister) {
      args.unshift('-r', tsNodeRegister);

      env = { ...env, ...getTsNodeEnv(tsconfig, transpileOnly) };
    }

    logger.info([`Executing${tsNodeRegister ? ' [TS]' : ''}:`, nodeExecPath, ...args].join(' '));

    await execa(nodeExecPath, args, {
      stdio: 'inherit',
      extendEnv: false,
      env,
      ...spawnOptions,
    });
  };
}
