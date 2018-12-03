import Undertaker from 'undertaker';
import { undertaker } from './undertaker';
import { Arguments, CommandModule } from 'yargs';
import { ILogger } from './logger';
import { Duplex } from 'stream';
import { taskCommandModuleMap } from './taskCommandModuleMap';

interface TaskContext {
  argv: Arguments;
  logger: ILogger;
}

interface TaskFunction extends Undertaker.TaskFunctionParams {
  (this: TaskContext, done: (error?: any) => void): void | Duplex | NodeJS.Process | Promise<never> | any;
}

function task(firstParam: string | TaskFunction, secondParam?: TaskFunction | Partial<CommandModule>, thirdParam?: TaskFunction) {
  if (arguments.length === 1 && typeof firstParam === 'string') {
    return undertaker.task(firstParam as string);
  } else if (arguments.length === 2) {
    undertaker.task(firstParam as any, secondParam as TaskFunction);
  } else if (arguments.length === 3 && typeof firstParam === 'string' && typeof thirdParam === 'function') {
    const commandModule = secondParam as Partial<CommandModule>;

    taskCommandModuleMap[firstParam as string] = {
      command: firstParam,
      builder: commandModule.builder,
      describe: commandModule.describe,
      aliases: commandModule.aliases
    };

    undertaker.task(firstParam as any, thirdParam);
  } else {
    throw new Error('Invalid parameter given in task() function');
  }
}

export { task };
