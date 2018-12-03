import Undertaker from 'undertaker';
import { undertaker } from './undertaker';
import { Arguments, CommandModule } from 'yargs';
import { ILogger } from './logger';
import { Duplex } from 'stream';

interface TaskContext {
  argv: Arguments;
  logger: ILogger;
}

interface TaskFunction extends Undertaker.TaskFunctionParams {
  (this: TaskContext, done: (error?: any) => void): void | Duplex | NodeJS.Process | Promise<never> | any;
}

const taskCommandModuleMap: { [taskName: string]: CommandModule } = {};

function task(firstParam: string | TaskFunction, secondParam?: TaskFunction | CommandModule, thirdParam?: TaskFunction) {
  if (arguments.length === 1 && typeof firstParam === 'string') {
    return undertaker.task(firstParam as string);
  } else if (arguments.length === 2) {
    undertaker.task(firstParam as any, secondParam as TaskFunction);
  } else if (arguments.length === 3 && typeof firstParam === 'string' && typeof thirdParam === 'function') {
    taskCommandModuleMap[firstParam as string] = secondParam as CommandModule;
    undertaker.task(firstParam as any, thirdParam);
  } else {
    throw new Error('Invalid parameter given in task() function');
  }
}

export { task };
export { taskCommandModuleMap };
