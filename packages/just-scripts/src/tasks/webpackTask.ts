// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import { logger, argv, resolveCwd, TaskFunction } from 'just-task';
import { tryRequire } from '../tryRequire';
import fs from 'fs';
import webpackMerge from 'webpack-merge';

export interface WebpackTaskOptions extends Configuration {
  config?: string;

  /** true to output to stats.json; a string to output to a file */
  outputStats?: boolean | string;

  /**
   * Arguments to be passed into a spawn call for webpack dev server. This can be used to do things
   * like increase the heap space for the JS engine to address out of memory issues.
   */
  nodeArgs?: string[];

  /**
   * Environment variables to be passed to the webpack-dev-server
   */
  env?: NodeJS.ProcessEnv;
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
        webpackConfigs = configLoader(argv().env, argv());
      } else {
        webpackConfigs = configLoader;
      }

      if (!Array.isArray(webpackConfigs)) {
        webpackConfigs = [webpackConfigs];
      }

      // Convert everything to promises first to make sure we resolve all promises
      const webpackConfigPromises = await Promise.all(webpackConfigs.map(webpackConfig => Promise.resolve(webpackConfig)));

      // We support passing in arbitrary webpack config options that we need to merge with any read configs.
      // To do this, we need to filter out the properties that aren't valid config options and then run webpack merge.
      // A better long term solution here would be to have an option called webpackConfigOverrides instead of extending the configuration object.
      const { config, outputStats, nodeArgs, ...restConfig } = options || ({} as WebpackTaskOptions);

      webpackConfigs = webpackConfigPromises.map(webpackConfig => webpackMerge(webpackConfig, restConfig));

      return new Promise((resolve, reject) => {
        wp(webpackConfigs, (err: Error, stats: any) => {
          if (options && options.outputStats) {
            const statsFile = options.outputStats === true ? 'stats.json' : options.outputStats;
            fs.writeFileSync(statsFile, JSON.stringify(stats.toJson(), null, 2));
          }

          if (err || stats.hasErrors()) {
            logger.error(stats.toString({ children: webpackConfigs.map(c => c.stats) }));
            reject(`Webpack failed with ${stats.toJson('errors-only').errors.length} error(s).`);
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
