import fse from 'fs-extra';
import path from 'path';
import type { TaskFunction } from 'just-task';
import { logger } from 'just-task';
import parallelLimit from 'run-parallel-limit';

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

export function cleanTask(options?: CleanTaskOptions): TaskFunction {
  const { paths = defaultCleanPaths(), limit = 5 } = options || {};

  return function clean(done: (err: Error | null) => void) {
    logger.info(`Removing [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}]`);

    const cleanTasks = paths.map(
      cleanPath =>
        function (cb: (error: Error | null) => void) {
          fse.remove(cleanPath, cb);
        },
    );

    parallelLimit(cleanTasks, limit, done);
  };
}
