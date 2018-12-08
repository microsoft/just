import cpx from 'cpx';
import async from 'async';
import { logger } from 'just-task';

export function copyTask(paths: string[] = [], dest: string, limit: number = 5) {
  return function copy(done: (err?: Error) => void) {
    logger.info(`Copying [${paths.join(', ')}] to '${dest}'`);

    async.forEachLimit(
      paths,
      limit,
      (copyPath, cb) => {
        cpx.copy(copyPath, dest, cb);
      },
      () => {
        done();
      }
    );
  };
}
