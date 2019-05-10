import yargs from 'yargs';
import { undertaker } from './undertaker';
import { wrapTask } from './wrapTask';
import { TaskFunction } from './interfaces';

export function task(
  firstParam: string | TaskFunction,
  secondParam?: string | TaskFunction,
  thirdParam?: TaskFunction
): TaskFunction | void {
  const argCount = arguments.length;

  if (argCount === 1 && typeof firstParam === 'string') {
    return undertaker.task(firstParam);
  } else if (argCount === 2 && isString(firstParam) && isString(secondParam)) {
    // task('default', 'build');
    undertaker.task(firstParam, undertaker.series(secondParam));
    yargs.command(getCommandModule(firstParam, ''));
  } else if (argCount === 2 && isString(firstParam) && isTaskFunction(secondParam)) {
    // task('pretter', prettierTask());
    // task('custom', () => { ... });
    undertaker.task(firstParam, wrapTask(secondParam as TaskFunction));
    yargs.command(getCommandModule(firstParam, ''));
  } else if (argCount === 3 && isString(firstParam) && isString(secondParam) && isTaskFunction(thirdParam)) {
    // task('custom', 'describes this thing', () => { ... })
    undertaker.task(firstParam, wrapTask(thirdParam));
    yargs.command(getCommandModule(firstParam, secondParam));
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

function getCommandModule(taskName: string, describe?: string): yargs.CommandModule {
  return {
    command: taskName,
    describe,
    ...(taskName === 'default' ? { aliases: ['*'] } : {}),
    handler(argvParam: any) {
      return undertaker.parallel(taskName)(() => {});
    }
  };
}
