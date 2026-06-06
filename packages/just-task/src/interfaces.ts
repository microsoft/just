import type * as Undertaker from 'undertaker';

export type Task = string | TaskFunction;

export interface TaskFunction extends Undertaker.TaskFunctionParams {
  (done: (error?: any) => void): ReturnType<Undertaker.TaskFunction>;
  description?: string;
}
