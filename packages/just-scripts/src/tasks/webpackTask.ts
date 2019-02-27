import { logger, argv, resolve, resolveCwd, TaskFunction } from 'just-task';
import fs from 'fs';
import { encodeArgs, spawn } from 'just-scripts-utils';
import webpackMerge from 'webpack-merge';

declare var __non_webpack_require__: any;

export interface WebpackTaskOptions {
  config?: string;
  mode?: 'production' | 'development';
  // can contain other config values which are passed on to webpack
  [key: string]: any;
}

export function webpackTask(options?: WebpackTaskOptions): TaskFunction {
  const wp = require('webpack');

  return function webpack() {
    logger.info(`Running Webpack`);
    const webpackConfigPath = resolveCwd((options && options.config) || 'webpack.config.js');
    logger.info(`Webpack Config Path: ${webpackConfigPath}`);

    if (webpackConfigPath && fs.existsSync(webpackConfigPath)) {
      return new Promise((resolve, reject) => {
        fs.exists(webpackConfigPath, isFileExists => {
          if (!isFileExists) {
            return reject(`Cannot find webpack configuration file`);
          }

          const configLoader = __non_webpack_require__(webpackConfigPath);

          let webpackConfigs;

          // If the loaded webpack config is a function
          // call it with the original process.argv arguments from build.js.
          if (typeof configLoader == 'function') {
            webpackConfigs = configLoader(argv());
          } else {
            webpackConfigs = configLoader;
          }

          if (!Array.isArray(webpackConfigs)) {
            webpackConfigs = [webpackConfigs];
          }

          const { config, ...restConfig } = options || { config: null };
          webpackConfigs = webpackConfigs.map(webpackConfig =>
            webpackMerge(webpackConfig, restConfig)
          );

          wp(webpackConfigs, (err: Error, stats: any) => {
            if (err || stats.hasErrors()) {
              let errorStats = stats.toJson('errors-only');
              errorStats.errors.forEach((error: any) => {
                logger.error(error);
              });
              reject(`Webpack failed with ${errorStats.errors.length} error(s).`);
            } else {
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

export function webpackDevServerTask(options?: WebpackTaskOptions) {
  const configPath = resolveCwd((options && options.config) || 'webpack.serve.config.js');
  const cmd = resolve('webpack-dev-server/bin/webpack-dev-server.js');

  return function webpackDevServer() {
    console.log(cmd, configPath);

    if (cmd && configPath && fs.existsSync(configPath)) {
      const mode = (options && options.mode) || 'development';
      const args = [cmd, '--config', configPath, '--open', '--mode', mode];

      logger.info(cmd, encodeArgs(args).join(' '));
      return spawn(process.execPath, args, { stdio: 'inherit' });
    } else {
      logger.warn('no webpack.serve.config.js configuration found, skipping');
      return Promise.resolve();
    }
  };
}
