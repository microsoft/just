import * as fse from 'fs-extra';
import * as path from 'path';
import { logger, TaskFunction, clearCache } from 'just-task';
import parallelLimit = require('run-parallel-limit');

export interface CleanTaskOptions {
  /**
   * Paths to clean
   * @default defaultCleanPaths()
   */
  paths?: string[];
  /**
   * Limit on number of simultaneous cleaning tasks
   * @default 5
   */
  limit?: number;
}

export function defaultCleanPaths(): string[] {
  return ['lib', 'temp', 'dist', 'coverage'];
}

export function cleanTask(options?: CleanTaskOptions): TaskFunction;
/** @deprecated Use object param version */
export function cleanTask(paths?: string[], limit?: number): TaskFunction;
export function cleanTask(pathsOrOptions: string[] | CleanTaskOptions = {}, limit?: number): TaskFunction {
  let paths: string[];
  if (Array.isArray(pathsOrOptions)) {
    paths = pathsOrOptions;
  } else {
    paths = pathsOrOptions.paths || defaultCleanPaths();
    limit = limit || pathsOrOptions.limit;
  }
  limit = limit || 5;

  return function clean(done: (err: Error | null) => void) {
    logger.info(`Removing [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}]`);

    const cleanTasks = paths
      .map(
        cleanPath =>
          function (cb: (error: Error | null) => void) {
            fse.remove(cleanPath, cb);
          },
      )
      .concat((cb: (error: Error | null) => void) => {
        clearCache();
        cb(null);
      });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parallelLimit(cleanTasks, limit!, done);
  };
}
