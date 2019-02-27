import fse from 'fs-extra';
import parallelLimit from 'run-parallel-limit';
import path from 'path';
import { logger, TaskFunction } from 'just-task';

/**
 * Get a task which cleans built files.
 *
 * @param paths Paths to clean
 * @param cleanDefaultPaths If true (the default), will clean 'lib', 'temp', 'dist', 'coverage'
 * in addition to any specified paths
 * @param limit Limit on parallel processes
 */
export function cleanTask(
  paths: string[] = [],
  cleanDefaultPaths: boolean = true,
  limit: number = 5
): TaskFunction {
  if (cleanDefaultPaths) {
    paths = [...paths, 'lib', 'temp', 'dist', 'coverage'];
  }

  return function clean(done: (err?: Error) => void) {
    logger.info(`Removing [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}]`);

    const cleanTasks = paths.map(
      cleanPath =>
        function(cb: (error: Error) => void) {
          fse.remove(cleanPath, cb);
        }
    );

    parallelLimit(cleanTasks, limit, done);
  };
}
