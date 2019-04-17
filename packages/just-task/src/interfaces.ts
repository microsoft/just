import { Arguments } from 'yargs';
import Undertaker from 'undertaker';
import { Logger } from './logger';
import { Duplex } from 'stream';

export type Task = string | TaskFunction;

export interface TaskContext {
  argv: Arguments;
  logger: Logger;
}

export interface TaskFunction extends Undertaker.TaskFunctionParams {
  (this: TaskContext, done: (error?: any) => void): void | Duplex | NodeJS.Process | Promise<never> | any;
}
