import { undertaker } from './undertaker';
import { wrapTask } from './wrapTask';
import type { TaskFunction } from './interfaces';

/**
 * Look up a previously registered task by name and return its (wrapped) function.
 * Throws if no task with that name has been registered.
 */
export function task(name: string): TaskFunction;
/**
 * Register `name` as a task that runs the already-registered task `dependencyName`
 * (wrapped in a series).
 */
export function task(name: string, dependencyName: string): TaskFunction;
/**
 * Register `name` with the given task function implementation.
 */
export function task(name: string, fn: TaskFunction): TaskFunction;
/**
 * Register `name` with a human-readable `description` and a task function implementation.
 */
export function task(name: string, description: string, fn: TaskFunction): TaskFunction;
export function task(
  firstParam: string | TaskFunction,
  secondParam?: string | TaskFunction,
  thirdParam?: TaskFunction,
): TaskFunction {
  const argCount = arguments.length;

  if (argCount === 1 && typeof firstParam === 'string') {
    // task('build');
    const t = undertaker.task(firstParam);
    if (!t) throw new Error(`No task found with name ${firstParam}`);
    return t;
  }

  if (argCount === 2 && isString(firstParam) && isString(secondParam)) {
    // task('default', 'build');
    const wrapped = wrapTask(undertaker.series(secondParam));
    undertaker.task(firstParam, wrapped);
    return wrapped;
  }

  if (argCount === 2 && isString(firstParam) && isTaskFunction(secondParam)) {
    // task('pretter', prettierTask());
    // task('custom', () => { ... });
    const wrapped = wrapTask(secondParam);
    undertaker.task(firstParam, wrapped);
    return wrapped;
  }

  if (argCount === 3 && isString(firstParam) && isString(secondParam) && isTaskFunction(thirdParam)) {
    // task('custom', 'describes this thing', () => { ... })
    const wrapped = wrapTask(thirdParam);
    wrapped.description = secondParam;
    undertaker.task(firstParam, wrapped);
    return wrapped;
  }

  throw new Error('Invalid parameter given in task() function');
}

function isString(param: string | TaskFunction | undefined): param is string {
  return typeof param === 'string';
}

function isTaskFunction(param: string | TaskFunction | undefined): param is TaskFunction {
  return typeof param === 'function';
}
