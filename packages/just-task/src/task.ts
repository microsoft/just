import Undertaker from 'undertaker';
import yargs from 'yargs';
import { undertaker } from './undertaker';
import { Arguments } from 'yargs';
import { ILogger } from './logger';
import { Duplex } from 'stream';
import { wrapTask } from './wrapTask';

interface TaskContext {
  argv: Arguments;
  logger: ILogger;
}

export interface TaskFunction extends Undertaker.TaskFunctionParams {
  (this: TaskContext, done: (error?: any) => void): void | Duplex | NodeJS.Process | Promise<never> | any;
}

function task(firstParam: string | TaskFunction, secondParam?: TaskFunction | string, thirdParam?: TaskFunction) {
  if (arguments.length === 1 && typeof firstParam === 'string') {
    return undertaker.task(firstParam);
  } else if (arguments.length === 2 && typeof firstParam === 'string' && typeof secondParam === 'function') {
    undertaker.task(firstParam, wrapTask(secondParam as TaskFunction));
    yargs.command(getCommandModule(firstParam));
  } else if (
    arguments.length === 3 &&
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

function getCommandModule(taskName: string, describe?: string) {
  return {
    command: taskName,
    describe,
    ...(taskName === 'default' && { aliases: ['*'] }),
    handler(argvParam: any) {
      return undertaker.parallel(taskName)(() => {});
    }
  };
}

export { task };
