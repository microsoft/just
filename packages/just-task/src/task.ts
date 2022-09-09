import { undertaker } from './undertaker';
import { wrapTask } from './wrapTask';
import { TaskFunction } from './interfaces';
import { registerCachedTask } from './cache';

export function task(
  firstParam: string | TaskFunction,
  secondParam?: string | TaskFunction,
  thirdParam?: TaskFunction,
): TaskFunction {
  const argCount = arguments.length;

  if (argCount === 1 && typeof firstParam === 'string') {
    return undertaker.task(firstParam) as TaskFunction;
  } else if (argCount === 2 && isString(firstParam) && isString(secondParam)) {
    // task('default', 'build');

    const wrapped = wrapTask(undertaker.series(secondParam));
    wrapped.cached = () => {
      registerCachedTask(firstParam);
    };

    undertaker.task(firstParam, wrapped);

    return wrapped;
  } else if (argCount === 2 && isString(firstParam) && isTaskFunction(secondParam)) {
    // task('pretter', prettierTask());
    // task('custom', () => { ... });
    const wrapped = wrapTask(secondParam as TaskFunction) as TaskFunction;
    wrapped.cached = () => {
      registerCachedTask(firstParam);
    };

    undertaker.task(firstParam, wrapped);

    return wrapped;
  } else if (argCount === 3 && isString(firstParam) && isString(secondParam) && isTaskFunction(thirdParam)) {
    // task('custom', 'describes this thing', () => { ... })
    const wrapped = wrapTask(thirdParam);
    wrapped.cached = () => {
      registerCachedTask(firstParam);
    };

    wrapped.description = secondParam;

    undertaker.task(firstParam, wrapped);

    return wrapped;
  } else {
    throw new Error('Invalid parameter given in task() function');
  }
}

function isString(param: string | TaskFunction | undefined): param is string {
  return typeof param === 'string';
}

function isTaskFunction(param: string | TaskFunction | undefined): param is TaskFunction {
  return typeof param === 'function';
}
