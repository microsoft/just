import { logger, type TaskFunction } from 'just-task';
import { resolveBin } from '../tryRequire';
import { spawnNode } from '../utils/exec';

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

    await spawnNode(webpackCliBin, options.webpackCliArgs || [], { env: options.env, nodeArgs: options.nodeArgs });
  };
}
