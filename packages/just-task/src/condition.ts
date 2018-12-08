import yargs from 'yargs';
import { argv } from './option';
import { parallel } from './undertaker';

export function condition(taskName: string, conditional: (argv: yargs.Arguments) => boolean) {
  return function(done: any) {
    if (conditional && conditional(argv())) {
      parallel(taskName)(done);
    } else {
      done();
    }
  };
}
