import { Arguments } from 'yargs-parser';
import { TaskFunctionParams } from 'undertaker';
import { Logger } from './logger';
import { Duplex } from 'stream';

export type Task = string | TaskFunction;

export interface TaskContext {
  argv: Arguments;
  logger: Logger;
}

export interface TaskFunction extends TaskFunctionParams {
  (this: TaskContext, done: (error?: any) => void): void | Duplex | NodeJS.Process | Promise<never> | any;
  cached?: () => void;
  description?: string;
}
