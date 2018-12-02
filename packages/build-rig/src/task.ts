import Undertaker from 'undertaker';
import { undertaker } from './undertaker';
import { Arguments } from 'yargs';
import { taskLogger, ILogger } from './logger';
import { Duplex } from 'stream';

interface TaskContext {
  argv: Arguments;
  logger: ILogger;
}

interface TaskFunction extends Undertaker.TaskFunctionParams {
  (this: TaskContext, done: (error?: any) => void): void | Duplex | NodeJS.Process | Promise<never> | any;
}

/**
 * This form of task definition takes a name and also a function
 * @param firstParam
 * @param fn
 */
function task(firstParam: string | TaskFunction, fn?: TaskFunction) {
  let taskName: string = firstParam as string;

  if (typeof firstParam === 'function') {
    fn = firstParam;
    taskName = fn.displayName || fn.name || 'unnamedTask';
  }

  if (!fn) {
    return undertaker.task(taskName);
  }

  undertaker.task(taskName, _wrapFunction(taskName, fn));
}

function _wrapFunction(taskName: string, fn: TaskFunction) {
  const wrapped: Undertaker.TaskFunction = function(this: TaskContext, done: any) {
    const context: TaskContext = {
      argv: (undertaker.registry() as any).argv,
      logger: taskLogger(taskName)
    };

    if (fn.length >= 1) {
      try {
        (fn as any).call(context, done);
      } catch (e) {
        done(e);
      }
    } else {
      // This is a synchronous OR non-callback based function, call "done" here for the user
      let results;

      try {
        results = (fn as any).apply(context);
      } catch (e) {
        if (done) {
          return done(e);
        }
      }

      if (done) {
        if (results && results.then) {
          results
            .then(() => {
              done();
            })
            .catch((e: any) => {
              done(e);
            });
        } else {
          done();
        }
      }
    }
  };

  return wrapped;
}

export { task };
