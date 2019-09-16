import { logger, TaskFunction } from 'just-task';
import { tryRequire } from '../tryRequire';

/**
 * webpackCliInitTask - task for webpack-cli init command
 *
 * @param  {string} customScaffold? - to pass any webpack-scaffold
 * @param  {Boolean=false} auto - to pass the --auto flag, which will generate a default webpack.config.js
 * @returns TaskFunction
 */
export function webpackCliInitTask(customScaffold?: string, auto: Boolean = false): TaskFunction {
  return async function webpackCli() {
    const init = tryRequire('@webpack-cli/init').default;
    if (!init) {
      logger.warn('webpack-cli init requires three dependencies: @webpack-cli/init (preferred - as a devDependency)');
      return;
    }
    logger.info(`Running Webpack-cli init `);
    if (typeof customScaffold === 'undefined') {
      if (auto) {
        try {
          init(null, null, null, '--auto');
        } catch (error) {
          throw `Webpack-cli init failed with ${error.length} error(s).`;
        }
      } else {
        try {
          init();
        } catch (error) {
          throw `Webpack-cli init failed with ${error.length} error(s).`;
        }
      }
    } else {
      logger.info(`Running the Scaffold ${customScaffold}`);
      try {
        init(null, null, customScaffold);
      } catch (error) {
        throw `Webpack-cli init failed with ${error.length} error(s).`;
      }
    }
  };
}
