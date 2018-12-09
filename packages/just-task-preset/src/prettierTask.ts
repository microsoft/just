import { logger } from 'just-task';

export function jestTask() {
  return function jest(done: (err?: Error) => void) {
    logger.info(`Running Jest`);
    done();
  };
}
