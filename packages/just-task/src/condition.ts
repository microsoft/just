import yargs from 'yargs';
import { parallel } from './undertaker';
import { task } from './task';

export function condition(taskName: string, conditional: (argv: yargs.Arguments) => boolean) {
  const conditionalTaskName = `${taskName}?`;

  return function(done: any) {
    task(conditionalTaskName, function(cb) {
      if (conditional && conditional(this.argv)) {
        return parallel(taskName)(cb);
      }

      cb();
    });

    parallel(conditionalTaskName)(done);
  };
}
