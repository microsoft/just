import { SpawnOptions } from 'child_process';
import { spawn } from 'just-scripts-utils';
import { logger, _spawnWithTS, TaskFunction, TSExecutor } from 'just-task';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';

export interface NodeExecTaskOptions {
  /**
   * Arguments to be passed to the spawn call.
   */
  args?: string[];

  /**
   * Environment variables to be passed to the spawn call.
   */
  env?: NodeJS.ProcessEnv;

  /**
   * Whether this task should use ts-node to execute the binary.
   * NOTE: To use `ts-node/esm` or `tsx`, set `executor` instead.
   */
  enableTypeScript?: boolean;

  /**
   * The TS executor to use for running the task.
   * If neither this nor `enableTypeScript` is set, runs as standard JS.
   */
  executor?: TSExecutor;

  /**
   * The tsconfig file to pass to ts-node for Typescript config
   */
  tsconfig?: string;

  /**
   * Only transpile the task file (don't type check)
   * @default true
   */
  transpileOnly?: boolean;

  /**
   * Custom spawn options
   */
  spawnOptions?: SpawnOptions;
}

export function nodeExecTask(options: NodeExecTaskOptions): TaskFunction {
  return function () {
    const { enableTypeScript, tsconfig, transpileOnly, executor } = options;
    const args = [...(options.args || [])];
    const env = { ...options.env };
    const spawnOpts: SpawnOptions = { stdio: 'inherit', ...options.spawnOptions, env };
    const nodeExecPath = process.execPath;

    if (!enableTypeScript && !executor) {
      logger.info('Executing: ' + [nodeExecPath, ...args].join(' '));
      return spawn(nodeExecPath, args, spawnOpts);
    }

    Object.assign(env, getTsNodeEnv(tsconfig, transpileOnly));

    return _spawnWithTS({
      cmd: nodeExecPath,
      args,
      opts: spawnOpts,
      executor: executor || 'ts-node',
    });
  };
}
