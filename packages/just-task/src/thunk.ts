import { TaskFunction } from './task';
import { wrapTask } from './wrapTask';

export function thunk(thunkFn: () => TaskFunction) {
  return wrapTask(thunkFn());
}
