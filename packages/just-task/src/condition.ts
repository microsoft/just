import type { TaskFunction } from './interfaces';
import { parallel } from './undertaker';

export function condition(taskName: string, conditional: () => boolean): TaskFunction {
  return function (done) {
    if (conditional && conditional()) {
      parallel(taskName)(done);
    } else {
      done();
    }
  };
}
