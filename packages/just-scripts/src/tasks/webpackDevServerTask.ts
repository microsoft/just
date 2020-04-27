// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import { encodeArgs, spawn } from 'just-scripts-utils';
import { logger, resolve, resolveCwd } from 'just-task';
import fs from 'fs';
import { WebpackCliTaskOptions } from './webpackCliTask';

export interface WebpackDevServerTaskOptions extends WebpackCliTaskOptions, Configuration {
  config?: string;

  mode?: 'production' | 'development';

  /**
   * If set to true, webpack will open browser page automatically when running the dev server
   */
  open?: boolean;
}

export function webpackDevServerTask(options: WebpackDevServerTaskOptions = {}) {
  const configPath = resolveCwd((options && options.config) || 'webpack.serve.config.js');
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

      logger.info(process.execPath, encodeArgs(args).join(' '));
      return spawn(process.execPath, args, { stdio: 'inherit', env: options.env });
    } else {
      logger.warn('no webpack.serve.config.js configuration found, skipping');
      return Promise.resolve();
    }
  };
}
