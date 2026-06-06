import type { TaskCallback } from 'undertaker';
import type { TaskFunction } from './interfaces';

export type MaybeWrappedTaskFunction = TaskFunction & {
  unwrap?: () => TaskFunction;
};

export function wrapTask(fn: MaybeWrappedTaskFunction): TaskFunction {
  return function _wrapFunction(done?: TaskCallback) {
    // unclear exactly what's happening here or if this could ever be undefined
    done ??= () => undefined;

    let origFn = fn;
    if (fn.unwrap) {
      origFn = fn.unwrap();
    }

    if (origFn.length > 0) {
      // `name` is marked as optional on TaskFunction, which conflicts with Function
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      (fn as Function).call(null, done);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-assignment
      const results = (origFn as Function).call(null);

      // The result is a function, we will assume that this is a task function to be called
      if (results && typeof results === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-function-type
        return (results as Function).call(null, done);
      } else if ((results as Promise<unknown> | undefined)?.then) {
        return results as Promise<unknown>;
      }

      if (typeof done === 'function') {
        done();
      }
    }
  };
}
