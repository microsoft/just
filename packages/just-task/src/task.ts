import Undertaker from 'undertaker';
import yargs, { Arguments } from 'yargs';
import { undertaker } from './undertaker';
import { Logger } from './logger';
import { Duplex } from 'stream';
import { wrapTask } from './wrapTask';

export interface TaskContext {
  argv: Arguments;
  logger: Logger;
}

export interface TaskFunction extends Undertaker.TaskFunctionParams {
  (this: TaskContext, done: (error?: any) => void):
    | void
    | Duplex
    | NodeJS.Process
    | Promise<never>
    | any;
}

export function task(
  firstParam: string | TaskFunction,
  secondParam?: TaskFunction | string,
  thirdParam?: TaskFunction
): Undertaker.TaskFunction | undefined {
  const argCount = arguments.length;
  if (argCount === 1 && typeof firstParam === 'string') {
    return undertaker.task(firstParam);
  } else if (
    argCount === 2 &&
    typeof firstParam === 'string' &&
    typeof secondParam === 'function'
  ) {
    undertaker.task(firstParam, wrapTask(secondParam as TaskFunction));
    yargs.command(getCommandModule(firstParam));
  } else if (
    argCount === 3 &&
    typeof firstParam === 'string' &&
    typeof secondParam === 'string' &&
    typeof thirdParam === 'function'
  ) {
    undertaker.task(firstParam, wrapTask(thirdParam));
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
