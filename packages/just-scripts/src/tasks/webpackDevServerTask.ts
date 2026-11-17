import fs from 'fs';
import type { TaskFunction } from 'just-task';
// WARNING: Careful about adding more imports - only import types from webpack
import type { Configuration } from 'webpack';
import { resolveBin, resolveWrapper } from '../tryRequire';
import { spawnNode } from '../utils/exec';
import { findWebpackConfig } from '../webpack/findWebpackConfig';
import type { WebpackCliTaskOptions } from './webpackCliTask';

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
   * Environment variables to be passed to the spawned process of `webpack-dev-server`
   * (merged with `process.env`).
   */
  env?: NodeJS.ProcessEnv;
}

/**
 * Create a task for running a webpack dev server.
 * Throws if `webpack` or `webpack-cli` is not found.
 */
export function webpackDevServerTask(options: WebpackDevServerTaskOptions = {}): TaskFunction {
  return async function webpackDevServer() {
    const configPath = findWebpackConfig({ configOption: options.config, tryServeConfig: true });

    const webpackCliPackageJsonPath = resolveWrapper('webpack-cli/package.json');
    if (!webpackCliPackageJsonPath) {
      throw new Error('Missing webpack-cli package. Please install webpack-cli as a devDependency.');
    }
    const webpackBinPath = resolveBin('webpack');
    if (!webpackBinPath) {
      throw new Error(`Cannot find webpack package`);
    }

    const args = ['serve'];

    if (configPath && fs.existsSync(configPath)) {
      args.push('--config', configPath);
    }

    if (options.open) {
      args.push('--open');
    }

    if (options.mode) {
      args.push('--mode', options.mode);
    }

    if (options.webpackCliArgs) {
      args.push(...options.webpackCliArgs);
    }

    await spawnNode(webpackBinPath, args, { env: options.env, nodeArgs: options.nodeArgs });
  };
}
