import { SpawnOptions } from 'child_process';
import { spawn } from 'just-scripts-utils';
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
   * Whether this nodeExec task should use ts-node to execute the binary.
   * If set to `esm`, it will use `ts-node/esm` instead of `ts-node/register`.
   */
  enableTypeScript?: boolean | 'esm';

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
    const args = [...(options.args || [])];
    const env = { ...options.env };

    const esm = enableTypeScript === 'esm';
    const tsNodeHelper = resolveCwd(esm ? 'ts-node/esm.mjs' : 'ts-node/register');
    const nodeExecPath = process.execPath;

    if (enableTypeScript && tsNodeHelper) {
      args.unshift(esm ? '--loader' : '-r', tsNodeHelper);
      Object.assign(env, getTsNodeEnv(tsconfig, transpileOnly, esm));

      logger.info('Executing [TS]: ' + [nodeExecPath, ...args].join(' '));
    } else {
      logger.info('Executing: ' + [nodeExecPath, ...args].join(' '));
    }

    return spawn(nodeExecPath, args, { stdio: 'inherit', env, ...spawnOptions });
  };
}
