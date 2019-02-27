import { logger, argv, resolve, resolveCwd, TaskFunction } from 'just-task';
import fs from 'fs-extra';
import { encodeArgs, spawn } from 'just-scripts-utils';
import webpackMerge from 'webpack-merge';

import webpack from 'webpack';

export interface WebpackTaskOptions {
  /** Path to config file (relative to working directory) */
  config?: string;
  mode?: 'production' | 'development';
}

/**
 * Generate a task function which runs webpack.
 *
 * @param webpackModule Webpack module (`import webpack from 'webpack'`). This is needed because
 * just-scripts does not take a (non-dev) dependency on or bundle webpack.
 * @param options Build options
 */
export function webpackTask(webpackModule: any, options: WebpackTaskOptions = {}): TaskFunction {
  return function webpackFn() {
    logger.info(`Running Webpack`);
    const webpackConfigPath = resolveCwd(options.config || 'webpack.config.js');
    logger.info(`Webpack config path: ${webpackConfigPath}`);

    if (webpackConfigPath && fs.existsSync(webpackConfigPath)) {
      return new Promise((resolve, reject) => {
        fs.exists(webpackConfigPath, isFileExists => {
          if (!isFileExists) {
            return reject(`Cannot find webpack configuration file`);
          }

          const configLoader:
            | webpack.Configuration
            | ((args: any) => webpack.Configuration) = __non_webpack_require__(webpackConfigPath);

          let webpackConfig: webpack.Configuration;

          // If the loaded webpack config is a function
          // call it with the original process.argv arguments from build.js.
          if (typeof configLoader == 'function') {
            webpackConfig = configLoader(argv());
          } else {
            webpackConfig = configLoader;
          }

          const { config, ...restConfig } = options || { config: null };
          webpackConfig = webpackMerge(webpackConfig, restConfig);

          const wp: typeof webpack = webpackModule;
          wp(webpackConfig, (err: Error, stats: webpack.Stats) => {
            if (err || stats.hasErrors()) {
              let errorStats = stats.toJson('errors-only');
              errorStats.errors.forEach((error: any) => {
                logger.error(error);
              });
              reject(`Webpack failed with ${errorStats.errors.length} error(s).`);
            } else {
              logger.info(stats);
              resolve();
            }
          });
        });
      });
    } else {
      logger.info('webpack.config.js not found, skipping webpack');
    }
  };
}

export function webpackDevServerTask(options: WebpackTaskOptions = {}) {
  const configPath = resolveCwd(options.config || 'webpack.serve.config.js');
  const cmd = resolve('webpack-dev-server/bin/webpack-dev-server.js');

  return function webpackDevServer() {
    console.log(cmd, configPath);

    if (cmd && configPath && fs.existsSync(configPath)) {
      const mode = options.mode || 'development';
      const args = [cmd, '--config', configPath, '--open', '--mode', mode];

      logger.info(cmd, encodeArgs(args).join(' '));
      return spawn(process.execPath, args, { stdio: 'inherit' });
    } else {
      logger.warn('no webpack.serve.config.js configuration found, skipping');
      return Promise.resolve();
    }
  };
}
