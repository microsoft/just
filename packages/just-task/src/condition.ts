import yargs from 'yargs';
import { parallel } from './undertaker';
import { ILogger } from './logger';
import chalk from 'chalk';

export function condition(taskName: string, conditional: (argv: yargs.Arguments) => boolean) {
  return function condition(this: { logger: ILogger; argv: yargs.Arguments }, done: (err?: Error) => void) {
    if (conditional && conditional(this.argv)) {
      return parallel(taskName)(done);
    }

    this.logger.info(`skipped '${chalk.cyan(taskName)}'`);
    done();
  };
}
