// // WARNING: Careful about add more imports - only import types from webpack
import type { Configuration } from 'webpack';
import { logNodeCommand, spawn } from '../utils';
import type { TaskFunction } from 'just-task';
import { resolveCwd } from 'just-task';
import fs from 'fs';
import path from 'path';
import type { WebpackCliTaskOptions } from './webpackCliTask';
import { getTsNodeEnv } from '../typescript/getTsNodeEnv';
import { findWebpackConfig } from '../webpack/findWebpackConfig';
import { resolveWrapper } from '../tryRequire';

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

/**
 * Create a task for running a webpack dev server.
 * Throws if `webpack` is not found.
 */
export function webpackDevServerTask(options: WebpackDevServerTaskOptions = {}): TaskFunction {
  const configPath = options?.config
    ? // don't attempt to resolve as a package
      resolveCwd(path.isAbsolute(options.config) ? options.config : path.join('.', options.config))
    : findWebpackConfig('webpack.serve.config.js', 'webpack.config.js');

  const webpackCliPackageJsonPath = resolveWrapper('webpack-cli/package.json');
  if (!webpackCliPackageJsonPath) {
    throw new Error('Missing webpack-cli package. Please install webpack-cli as a devDependency.');
  }
  const webpackBin = 'webpack/bin/webpack.js';
  const webpackBinPath = resolveWrapper(webpackBin);
  if (!webpackBinPath) {
    throw new Error(`Cannot find webpack (${webpackBin})`);
  }

  return function webpackDevServer() {
    const args = [...(options.nodeArgs || []), webpackBinPath, 'serve'];

    if (configPath && fs.existsSync(configPath)) {
      args.push('--config', configPath);
      options.env = {
        ...options.env,
        ...(configPath.endsWith('.ts') && getTsNodeEnv(options.tsconfig, options.transpileOnly)),
      };
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

    logNodeCommand(args);
    return spawn(process.execPath, args, { stdio: 'inherit', env: options.env });
  };
}
