import { undertaker, series } from './undertaker';

let counter = 0;

export function wrapTask(fn: any) {
  const wrappedFunction = function wrapFunction(done: any) {
    let origFn = fn;
    if (fn.unwrap) {
      origFn = fn.unwrap();
    }

    if (origFn.length > 0) {
      (fn as any).call(null, done);
    } else {
      let results = (origFn as any).call();

      // The result is a function, we will assume that this is a task function to be called
      if (results && typeof results === 'function') {
        return results.call(null, done);
      } else if (results && results.then) {
        return results;
      }

      done();
    }
  };

  wrappedFunction.runBefore = function runBefore(taskName: string) {
    const id = `${taskName}_before_${counter++}?`;

    undertaker.task(id, undertaker.task(taskName));
    undertaker.task(taskName, series(wrappedFunction, id));
  };

  wrappedFunction.runAfter = function runAfter(taskName: string) {
    const id = `${taskName}_after_${counter++}?`;

    undertaker.task(id, undertaker.task(taskName));
    undertaker.task(taskName, series(id, wrappedFunction));
  };

  return wrappedFunction;
}
