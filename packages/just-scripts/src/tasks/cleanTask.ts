import fse from 'fs-extra';
import parallelLimit from 'run-parallel-limit';
import path from 'path';
import { logger, TaskFunction } from 'just-task';

export interface CleanOptions {
  paths?: string[];
  limit?: number;
}

export function cleanTask(options: CleanOptions = {}): TaskFunction {
  const { paths = ['lib', 'temp', 'dist', 'coverage'], limit = 5 } = options;

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
