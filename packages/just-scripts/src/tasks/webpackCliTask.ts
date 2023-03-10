import { logger, TaskFunction, resolve } from 'just-task';
import { spawn } from '../utils';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';
import { findWebpackConfig } from '../webpack/findWebpackConfig';

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
 * webpackCliTask - task for running webpack as a cli command
 */
export function webpackCliTask(options: WebpackCliTaskOptions = {}): TaskFunction {
  const webpackCliCmd = resolve('webpack-cli/bin/cli.js');

  if (!webpackCliCmd) {
    throw new Error('cannot find webpack-cli, please install it');
  }

  return function webpackCli() {
    logger.info(`Running webpack-cli as a node process`);

    const args = [
      ...(options && options.nodeArgs ? options.nodeArgs : []),
      webpackCliCmd,
      ...(options && options.webpackCliArgs ? options.webpackCliArgs : []),
    ];

    let configPath = findWebpackConfig('webpack.config.js');

    if (configPath) {
      options.env = {
        ...options.env,
        ...(configPath.endsWith('.ts') && getTsNodeEnv(options.tsconfig, options.transpileOnly)),
      };
    }

    if (options.webpackCliArgs) {
      const configIndex = options.webpackCliArgs.indexOf('--config');
      const configPathAvailable = configIndex > -1 && options.webpackCliArgs.length > configIndex + 2;
      if (configPathAvailable) {
        configPath = options.webpackCliArgs[configIndex + 1];
      }
    }

    logger.info(`webpack-cli arguments: ${process.execPath} ${args.join(' ')}`);

    return spawn(process.execPath, args, { stdio: 'inherit', env: options.env });
  };
}
