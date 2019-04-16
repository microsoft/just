import yargs from 'yargs';
import { undertaker } from './undertaker';
import { wrapTask } from './wrapTask';
import { TaskFunction } from './interfaces';
import { TaskFunction as UndertakerTaskFunction } from 'undertaker';

export function task(
  firstParam: string | TaskFunction,
  secondParam?: string | TaskFunction,
  thirdParam?: TaskFunction
): TaskFunction | void {
  const argCount = arguments.length;

  if (argCount === 1 && typeof firstParam === 'string') {
    return undertaker.task(firstParam);
  } else if (argCount === 2 && typeof firstParam === 'string' && typeof secondParam === 'function') {
    wrapTask(undertaker.task(firstParam, wrapTask(secondParam as TaskFunction)));
    yargs.command(getCommandModule(firstParam));
  } else if (argCount === 3 && typeof firstParam === 'string' && typeof secondParam === 'string' && typeof thirdParam === 'function') {
    wrapTask(undertaker.task(firstParam, wrapTask(thirdParam)));
    yargs.command(getCommandModule(firstParam, secondParam));
  } else {
    throw new Error('Invalid parameter given in task() function');
  }
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
