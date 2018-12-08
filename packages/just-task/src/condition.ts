import { parallel } from './undertaker';

export function condition(taskName: string, conditional: () => boolean) {
  return function(done: any) {
    if (conditional && conditional()) {
      parallel(taskName)(done);
    } else {
      done();
    }
  };
}
