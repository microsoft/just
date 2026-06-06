import type Undertaker from 'undertaker';

export type Task = string | TaskFunction;

export interface TaskFunction extends Undertaker.TaskFunction {
  description?: string;
}
