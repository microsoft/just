import { logger, argv, resolve } from 'just-task';

import fs from 'fs';

function flatten(arr: any[]): any[] {
  return arr.reduce(function(flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export function webpackTask() {
  const wp = require('webpack');

  return function webpack() {
    logger.info(`Running Webpack`);
    const webpackConfigPath = resolve('./webpack.config.js');

    if (webpackConfigPath && fs.existsSync(webpackConfigPath)) {
      return new Promise((resolve, reject) => {
        fs.exists(webpackConfigPath, isFileExists => {
          if (!isFileExists) {
            return reject(`Cannot find webpack configuration file`);
          }

          const configLoader = require(webpackConfigPath);

          let config;

          // If the loaded webpack config is a function
          // call it with the original process.argv arguments from build.js.
          if (typeof configLoader == 'function') {
            config = configLoader(argv());
          } else {
            config = configLoader;
          }
          config = flatten(config);

          wp(config, (err: Error, stats: any) => {
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
