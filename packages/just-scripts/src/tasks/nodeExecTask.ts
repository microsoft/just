import { SpawnOptions } from 'child_process';
import { spawn } from '../utils';
import { logger, TaskFunction } from 'just-task';
import { resolveCwd, _tryResolve } from 'just-task/lib/resolve';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';

export interface NodeExecTaskOptions {
  /**
   * Arguments to be passed into a spawn call for webpack dev server. This can be used to do things
   * like increase the heap space for the JS engine to address out of memory issues.
   */
  args?: string[];

  /**
   * Environment variables to be passed to the webpack-cli
   */
  env?: NodeJS.ProcessEnv;

  /**
   * Should this nodeExec task be using something like ts-node to execute the binary
   */
  enableTypeScript?: boolean;

  /**
   * The tsconfig file to pass to ts-node for Typescript config
   */
  tsconfig?: string;

  /**
   * Transpile the config only
   */
  transpileOnly?: boolean;

  /**
   * Custom spawn options
   */
  spawnOptions?: SpawnOptions;
}

export function nodeExecTask(options: NodeExecTaskOptions): TaskFunction {
  return function () {
    const { spawnOptions, enableTypeScript, tsconfig, transpileOnly } = options;

    const tsNodeRegister = resolveCwd('ts-node/register');
    const nodeExecPath = process.execPath;

    if (enableTypeScript && tsNodeRegister) {
      options.args = options.args || [];
      options.args.unshift(tsNodeRegister);
      options.args.unshift('-r');

      options.env = { ...options.env, ...getTsNodeEnv(tsconfig, transpileOnly) };
      logger.info('Executing [TS]: ' + [nodeExecPath, ...(options.args || [])].join(' '));
    } else {
      logger.info('Executing: ' + [nodeExecPath, ...(options.args || [])].join(' '));
    }

    return spawn(nodeExecPath, options.args, { stdio: 'inherit', env: options.env, ...spawnOptions });
  };
}
