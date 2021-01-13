import { TaskFunction } from 'undertaker';
import { parallel } from './undertaker';

export function condition(taskName: string, conditional: () => boolean): TaskFunction {
  return function (done: any) {
    if (conditional && conditional()) {
      parallel(taskName)(done);
    } else {
      done();
    }
  };
}
