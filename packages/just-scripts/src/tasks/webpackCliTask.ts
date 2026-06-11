import { logger, type TaskFunction } from 'just-task';
import { resolveBin } from '../tryRequire';
import { getTsNodeEnv, isTsConfigFile } from '../typescript/getTsNodeEnv';
import { spawnNode } from '../utils/exec';
import { findWebpackConfig } from '../webpack/findWebpackConfig';

export interface WebpackCliTaskOptions {
  /**
   * Arguments for webpack-cli (e.g. --display-errors)
   */
  webpackCliArgs?: string[];

  /**
   * Arguments to be passed into a spawn call for webpack dev server. This can be used to do things
   * like increase the heap space for the JS engine to address out of memory issues.
   */
  nodeArgs?: string[];

  /**
   * Environment variables to be passed to the webpack-cli (merged with `process.env`).
   */
  env?: NodeJS.ProcessEnv;

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
 * Creates a task for running `webpack-cli`.
 * Throws if `webpack-cli` is not found.
 */
export function webpackCliTask(options: WebpackCliTaskOptions = {}): TaskFunction {
  return async function webpackCli() {
    const webpackCliBin = resolveBin('webpack-cli');
    if (!webpackCliBin) {
      throw new Error(`Cannot find webpack-cli`);
    }

    logger.info(`Running webpack-cli as a node process`);

    let configPath: string | null | undefined;
    if (options.webpackCliArgs) {
      const configIndex = options.webpackCliArgs.indexOf('--config');
      if (configIndex > -1) {
        configPath = options.webpackCliArgs[configIndex + 1]; // undefined if off the end
      }
    }
    if (!configPath) {
      configPath = findWebpackConfig();
    }

    let env = options.env;
    if (isTsConfigFile(configPath ?? '')) {
      env = {
        ...env,
        ...getTsNodeEnv(options.tsconfig, options.transpileOnly),
      };
    }

    await spawnNode(webpackCliBin, options.webpackCliArgs || [], { env, nodeArgs: options.nodeArgs });
  };
}
