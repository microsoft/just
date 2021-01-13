// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import { encodeArgs, spawn } from 'just-scripts-utils';
import { logger, resolve, resolveCwd, TaskFunction } from 'just-task';
import * as fs from 'fs';
import * as path from 'path';
import { WebpackCliTaskOptions } from './webpackCliTask';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';
import { findWebpackConfig } from '../webpack/findWebpackConfig';

export interface WebpackDevServerTaskOptions extends WebpackCliTaskOptions, Configuration {
  /**
   * Alternate configuration file
   */
  config?: string;

  /**
   * Arguments to be passed into a spawn call for webpack dev server. This can be used to do things
   * like increase the heap space for the JS engine to address out of memory issues.
   */
  nodeArgs?: string[];

  /**
   * Mode: production or development
   */
  mode?: 'production' | 'development';

  /**
   * If set to true, webpack will open browser page automatically when running the dev server
   */
  open?: boolean;

  /**
   * Environment variables to be passed to the spawned process of webpack-dev-server
   */
  env?: { [key: string]: string | undefined };

  /**
   * The tsconfig file to pass to ts-node for Typescript config
   */
  tsconfig?: string;

  /**
   * Transpile the config only
   */
  transpileOnly?: boolean;
}

export function webpackDevServerTask(options: WebpackDevServerTaskOptions = {}): TaskFunction {
  const configPath = options && options.config ? resolveCwd(path.join('.', options.config)) : findWebpackConfig('webpack.serve.config.js');

  const devServerCmd = resolve('webpack-dev-server/bin/webpack-dev-server.js');

  return function webpackDevServer() {
    if (devServerCmd && configPath && fs.existsSync(configPath)) {
      let args = [...(options.nodeArgs || []), devServerCmd, '--config', configPath];
      if (options.open) {
        args.push('--open');
      }
      if (options.mode) {
        args = [...args, '--mode', options.mode];
      }
      if (options.webpackCliArgs) {
        args = [...args, ...options.webpackCliArgs];
      }

      options.env = { ...options.env, ...(configPath.endsWith('.ts') && getTsNodeEnv(options.tsconfig, options.transpileOnly)) };

      logger.info(process.execPath, encodeArgs(args).join(' '));
      return spawn(process.execPath, args, { stdio: 'inherit', env: options.env });
    } else {
      logger.warn(`${options?.config || 'webpack.serve.config.js'} not found, skipping`);
      return Promise.resolve();
    }
  };
}
