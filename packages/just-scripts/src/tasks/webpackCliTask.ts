import type { TaskFunction } from 'just-task';
import { logger } from 'just-task';
import { logNodeCommand, spawn } from '../utils';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';
import { findWebpackConfig } from '../webpack/findWebpackConfig';
import { resolveWrapper } from '../tryRequire';

export interface WebpackCliTaskOptions {
  /**
   * Arguments for webpack-cli (e.g. --display-errors)
   */
  webpackCliArgs?: string[];

  /**
   * Arguments to be passed into a spawn call for webpack dev server. This can be used to do things
   * like increase the heap space for the JS engine to address out of memory issues.
   */
  nodeArgs?: string[];

  /**
   * Environment variables to be passed to the webpack-cli
   */
  env?: NodeJS.ProcessEnv;

  /**
   * The tsconfig file to pass to ts-node for Typescript config
   */
  tsconfig?: string;

  /**
   * Transpile the config only
   */
  transpileOnly?: boolean;
}

/**
 * Creates a task for running `webpack-cli`.
 * Throws if `webpack-cli` is not found.
 */
export function webpackCliTask(options: WebpackCliTaskOptions = {}): TaskFunction {
  const cliPath = 'webpack-cli/bin/cli.js';
  const webpackCliCmd = resolveWrapper(cliPath);
  if (!webpackCliCmd) {
    throw new Error(`Cannot find webpack-cli (${cliPath})`);
  }

  return function webpackCli() {
    logger.info(`Running webpack-cli as a node process`);

    const args = [
      ...(options && options.nodeArgs ? options.nodeArgs : []),
      webpackCliCmd,
      ...(options && options.webpackCliArgs ? options.webpackCliArgs : []),
    ];

    let configPath = findWebpackConfig('webpack.config.js');

    if (!configPath && options.webpackCliArgs) {
      const configIndex = options.webpackCliArgs.indexOf('--config');
      if (configIndex > -1) {
        configPath = options.webpackCliArgs[configIndex + 1]; // undefined if off the end
      }
    }

    if (configPath && configPath.endsWith('.ts')) {
      options.env = {
        ...options.env,
        ...getTsNodeEnv(options.tsconfig, options.transpileOnly),
      };
    }

    logNodeCommand(args);

    return spawn(process.execPath, args, { stdio: 'inherit', env: options.env });
  };
}
