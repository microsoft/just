import type Undertaker from 'undertaker';
import type { TaskCallback } from 'undertaker';
import type { TaskFunction, TaskFunctionResult, NestedTaskFunction } from './interfaces';

/**
 * A {@link TaskFunction} that may also carry an `unwrap()` from a previous wrapping.
 */
export type MaybeWrappedTaskFunction = TaskFunction & {
  /**
   * Returns the original task function. Present on the composed functions
   * returned by `undertaker.series()` / `parallel()`; `wrapTask` calls it to
   * inspect the underlying function rather than the wrapper.
   */
  unwrap?: () => TaskFunction;
};

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return typeof (value as PromiseLike<unknown> | undefined)?.then === 'function';
}

/**
 * Adapts a just-task {@link TaskFunction} into a plain `Undertaker.TaskFunction`
 * that Undertaker knows how to run, bridging the extra behaviors just-task allows:
 *
 * - If the function declares a `done` parameter (`length > 0`), it is invoked
 *   with the callback and expected to signal completion via `done`.
 * - Otherwise it is called with no meaningful arguments and its return value is
 *   inspected:
 *   - a returned function is treated as the "factory" form — it is the actual
 *     task and is immediately invoked with `done`;
 *   - a returned promise (thenable) is passed straight back to Undertaker;
 *   - anything else is treated as synchronous and completed via `done()`.
 *
 * The returned `Undertaker.TaskFunction` always resolves to a leaf result, so it
 * remains compatible with `undertaker.task()`, `series()`, and `parallel()`.
 */
export function wrapTask(fn: MaybeWrappedTaskFunction): Undertaker.TaskFunction {
  return function _wrapFunction(done: TaskCallback = () => undefined) {
    let origFn: TaskFunction = fn;
    if (fn.unwrap) {
      origFn = fn.unwrap();
    }

    if (origFn.length > 0) {
      // The task takes `done`; let it signal completion itself.
      fn(done);
      return;
    }

    // This branch only runs when `origFn.length === 0`, i.e. the task declared no
    // `done` parameter, so it is called with no arguments. Passing `done` here would
    // be meaningless and could cause double-completion for a task that reads its
    // `arguments` and signals completion itself (we also call `done()` below).
    const results = (origFn as () => TaskFunctionResult | NestedTaskFunction)();

    // The result is a function, so assume it is the "factory" form's task function and run it.
    if (typeof results === 'function') {
      return results(done);
    }

    // A promise is returned to Undertaker so it can await completion.
    if (isPromiseLike(results)) {
      return results;
    }

    // Nothing async to await; complete synchronously.
    done();
  };
}
