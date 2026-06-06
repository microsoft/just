// // WARNING: Careful about add more imports - only import types from webpack
import type { Configuration, Stats } from 'webpack';
import { logger, argv, TaskFunction, resolveCwd } from 'just-task';
import { tryRequire } from '../tryRequire';
import * as fs from 'fs';
import * as path from 'path';
import { merge } from 'webpack-merge';
import { findWebpackConfig } from '../webpack/findWebpackConfig';
import { enableTypeScript } from 'just-task/lib/enableTypeScript';

export interface WebpackTaskOptions extends Configuration {
  config?: string;

  /** true to output to stats.json; a string to output to a file */
  outputStats?: boolean | string;

  /**
   * Environment variables to be passed to the webpack-dev-server
   */
  env?: NodeJS.ProcessEnv;

  /**
   * Transpile the config only
   */
  transpileOnly?: boolean;

  /**
   * Optional callback triggered on compile
   */
  onCompile?: (err: Error, stats: any) => void | Promise<void>;
}

export function webpackTask(options?: WebpackTaskOptions): TaskFunction {
  return async function webpack() {
    const wp = tryRequire('webpack') as typeof import('webpack') | undefined;

    if (!wp) {
      logger.warn('webpack is not installed, this task no effect');
      return;
    }

    logger.info(`Running Webpack`);

    const webpackConfigPath =
      options && options.config
        ? path.isAbsolute(options.config)
          ? options.config
          : resolveCwd(path.join('.', options.config))
        : findWebpackConfig('webpack.config.js');

    logger.info(`Webpack Config Path: ${webpackConfigPath}`);

    if (webpackConfigPath && fs.existsSync(webpackConfigPath) && webpackConfigPath.endsWith('.ts')) {
      const transpileOnly = options ? options.transpileOnly !== false : true;
      enableTypeScript({ transpileOnly });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const configModuleExports = webpackConfigPath ? require(path.resolve(webpackConfigPath)) : {};

    let webpackConfigs: Configuration[];

    // If the loaded webpack config is a function
    // call it with the original process.argv arguments from build.js.
    if (typeof configModuleExports == 'function') {
      const args = argv();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      webpackConfigs = configModuleExports(args.env, args);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      webpackConfigs = configModuleExports;
    }

    if (!Array.isArray(webpackConfigs)) {
      webpackConfigs = [webpackConfigs];
    }

    // Resolve all promises (if any values are promises)
    // eslint-disable-next-line @typescript-eslint/await-thenable
    webpackConfigs = await Promise.all(webpackConfigs);

    // We support passing in arbitrary webpack config options that we need to merge with any read configs.
    // To do this, we need to filter out the properties that aren't valid config options and then run webpack merge.
    // A better long term solution here would be to have an option called webpackConfigOverrides instead of extending the configuration object.
    const { config, outputStats, onCompile, ...restConfig } = options || {};

    webpackConfigs = webpackConfigs.map(webpackConfig => merge(webpackConfig, restConfig));

    return new Promise<void>((resolve, reject) => {
      // TODO fix all these types properly when updated to webpack 5
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      wp(webpackConfigs, async (err: Error, stats: any) => {
        if (options?.onCompile) {
          await options.onCompile(err, stats);
        }

        if (options?.outputStats) {
          const statsFile = options.outputStats === true ? 'stats.json' : options.outputStats;
          fs.writeFileSync(statsFile, JSON.stringify((stats as Stats).toJson(), null, 2));
        }

        if (err || (stats as Stats).hasErrors()) {
          // Stats may be undefined the the case of an error in Webpack 5
          if (stats) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            logger.error((stats as Stats).toString({ children: webpackConfigs.map(c => c.stats) as any }));
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(`Webpack failed with ${(stats as Stats).toJson('errors-only').errors.length} error(s).`);
          } else {
            logger.error(err.toString());
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(`Webpack failed with error(s).`);
          }
        } else {
          resolve();
        }
      });
    });
  };
}
