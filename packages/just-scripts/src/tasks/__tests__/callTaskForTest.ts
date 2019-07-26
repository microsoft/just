import asyncDoneAsCallback from 'async-done';
import { promisify } from 'util';
import { Arguments } from 'yargs';
import { logger, TaskFunction, TaskContext } from 'just-task';

const asyncDone = promisify(asyncDoneAsCallback);

/**
 * Wrapper to call task function for the test.
 */
function wrapTaskFunction(fn: TaskFunction, argv?: Arguments) {
  const argvOurs = argv || { _: [], $0: '' };
  const context: TaskContext = {
    argv: argvOurs,
    logger
  };
  const taskRet = (fn as any).call(context, (_err: any) => {});
  return taskRet;
}

/**
 * Call the task the way real code does.
 */
export function callTaskForTest(fn: TaskFunction, argv?: Arguments) {
  return asyncDone(() => {
    return wrapTaskFunction(fn, argv);
  });
}
