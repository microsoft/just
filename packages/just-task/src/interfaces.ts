import type Undertaker from 'undertaker';
import type { TaskCallback } from 'undertaker';

/**
 * A task is either the name of an already-registered task (resolved at runtime by Undertaker)
 * or a task function to be wrapped and run directly. This is the accepted type wherever the
 * API takes a task, e.g. `series()`/`parallel()`.
 */
export type Task = string | TaskFunction;

/**
 * The "leaf" value a task function may produce to signal completion. This is Undertaker's own
 * contract: return nothing (and instead invoke the `done` callback), or return a `Promise`,
 * `Stream`, `ChildProcess`, `EventEmitter`, or `Observable`.
 */
export type TaskFunctionResult = ReturnType<Undertaker.TaskFunction>;

/**
 * The function returned by the "factory" form of {@link TaskFunction}. `wrapTask` invokes it
 * with the `done` callback and uses its result.
 *
 * Its return type mirrors {@link TaskFunction}'s (`TaskFunctionResult | NestedTaskFunction`)
 * because the value returned by a factory is itself any task function — e.g. the result of
 * `tscTask()`, whose declared return type is a full `TaskFunction`. This is intentionally
 * self-referential so those task functions remain assignable here.
 */
export interface NestedTaskFunction {
  (done: TaskCallback): TaskFunctionResult | NestedTaskFunction;
}

/**
 * A just-task task function, as passed to `task()`, `series()`, and `parallel()`.
 *
 * In addition to Undertaker's contract (return a {@link TaskFunctionResult} or use the `done`
 * callback), just-task supports a "factory" form where the function returns *another* task
 * function instead of a leaf result. At runtime `wrapTask` detects the returned function and
 * calls it with `done`, enabling patterns like:
 *
 * ```ts
 * task('bundle', () => {
 *   const config = computeConfig();      // set-up runs once, eagerly
 *   return done => build(config, done);  // returned fn is the actual task
 * });
 * ```
 *
 * This extends `Undertaker.TaskFunctionParams` (rather than `Undertaker.TaskFunction`)
 * so it keeps the optional metadata (`name`, `description`, etc) while widening the
 * call signature's return type to also allow a {@link NestedTaskFunction}.
 */
export interface TaskFunction extends Undertaker.TaskFunctionParams {
  (done: TaskCallback): TaskFunctionResult | NestedTaskFunction;
  description?: string;
}
