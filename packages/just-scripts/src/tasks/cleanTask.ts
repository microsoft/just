import fse from 'fs-extra';
import parallelLimit from 'run-parallel-limit';
import path from 'path';
import { logger, TaskFunction } from 'just-task';

export interface CleanTaskOptions {
  /**
   * Paths to clean
   * @default defaultCleanPaths()
   */
  paths?: string[];
  /**
   * Limit on number of simultaneous processes for cleaning
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

  return function clean(done: (err?: Error) => void) {
    logger.info(`Removing [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}]`);

    const cleanTasks = paths.map(
      cleanPath =>
        function(cb: (error: Error) => void) {
          fse.remove(cleanPath, cb);
        }
    );

    parallelLimit(cleanTasks, limit!, done);
  };
}
