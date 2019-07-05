// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import { encodeArgs, spawn } from 'just-scripts-utils';
import { logger, argv, resolve, resolveCwd, TaskFunction } from 'just-task';
import { tryRequire } from '../tryRequire';
import fs from 'fs';
import webpackMerge from 'webpack-merge';

export interface WebpackTaskOptions extends Configuration {
  config?: string;

  /** true to output to stats.json; a string to output to a file */
  outputStats?: boolean | string;

  mode?: 'production' | 'development';
}

export function webpackTask(options?: WebpackTaskOptions): TaskFunction {
  return async function webpack() {
    const wp = tryRequire('webpack');

    if (!wp) {
      logger.warn('webpack is not installed, this task no effect');
      return;
    }

    logger.info(`Running Webpack`);
    const webpackConfigPath = resolveCwd((options && options.config) || 'webpack.config.js');
    logger.info(`Webpack Config Path: ${webpackConfigPath}`);

    if (webpackConfigPath && fs.existsSync(webpackConfigPath)) {
      const configLoader = require(webpackConfigPath);

      let webpackConfigs: Configuration[];

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

      // Convert everything to promises first to make sure we resolve all promises
      const webpackConfigPromises = await Promise.all(webpackConfigs.map(webpackConfig => Promise.resolve(webpackConfig)));

      const { ...restConfig } = options || {};

      webpackConfigs = webpackConfigPromises.map(webpackConfig => webpackMerge(webpackConfig, restConfig));

      return new Promise((resolve, reject) => {
        wp(webpackConfigs, (err: Error, stats: any) => {
          if (options && options.outputStats) {
            const statsFile = options.outputStats === true ? 'stats.json' : options.outputStats;
            fs.writeFileSync(statsFile, JSON.stringify(stats.toJson(), null, 2));
          }

          if (err || stats.hasErrors()) {
            const errorStats = stats.toJson('errors-only');
            errorStats.errors.forEach((error: any) => {
              logger.error(error);
            });
            reject(`Webpack failed with ${errorStats.errors.length} error(s).`);
          } else {
            resolve();
          }
        });
      });
    } else {
      logger.info('webpack.config.js not found, skipping webpack');
    }

    return;
  };
}

export function webpackDevServerTask(options?: WebpackTaskOptions) {
  const configPath = resolveCwd((options && options.config) || 'webpack.serve.config.js');
  const cmd = resolve('webpack-dev-server/bin/webpack-dev-server.js');

  return function webpackDevServer() {
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
