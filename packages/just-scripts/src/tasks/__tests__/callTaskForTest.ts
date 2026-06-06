import asyncDoneAsCallback from 'async-done';
import { promisify } from 'util';
import type { TaskFunction } from 'just-task';

const asyncDone = promisify(asyncDoneAsCallback);

/**
 * Call the task the way real code does.
 */
export function callTaskForTest(fn: TaskFunction): Promise<unknown> {
  return asyncDone(fn);
}
