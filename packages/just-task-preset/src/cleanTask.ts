import rimraf from 'rimraf';
import async from 'async';
import { logger } from 'just-task';

export function cleanTask(paths: string[] = [], limit: number = 5) {
  if (paths.length === 0) {
    paths = ['lib', 'temp', 'dist', 'coverage'];
  }

  return function clean(done: (err?: Error) => void) {
    logger.info(`Removing [${paths.join(', ')}]`);

    async.forEachLimit(
      paths,
      limit,
      (cleanPath, cb) => {
        rimraf(cleanPath, cb);
      },
      () => {
        done();
      }
    );
  };
}
