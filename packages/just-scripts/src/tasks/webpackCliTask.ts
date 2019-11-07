import { logger, TaskFunction, resolve } from 'just-task';
import { spawn } from 'just-scripts-utils';

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
}

/**
 * webpackCliTask - task for running webpack as a cli command
 *
 * @param  {string} customScaffold? - to pass any webpack-scaffold
 * @param  {Boolean=false} auto - to pass the --auto flag, which will generate a default webpack.config.js
 * @returns TaskFunction
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
      ...(options && options.webpackCliArgs ? options.webpackCliArgs : [])
    ];

    logger.info(`webpack-cli arguments: ${process.execPath} ${args.join(' ')}`);

    return spawn(process.execPath, args, { stdio: 'inherit', env: options.env });
  };
}
