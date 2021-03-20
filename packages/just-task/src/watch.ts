import * as globWatch from 'glob-watcher';
import { wrapTask } from './wrapTask';
import { TaskFunction } from './interfaces';
import type { WatchOptions, FSWatcher } from 'chokidar';

export function watch(
  globs: string | string[],
  optionsOrTaskFunction?: TaskFunction | WatchOptions | undefined,
  taskFunction?: TaskFunction | undefined,
): FSWatcher {
  let options: WatchOptions = {};
  if (typeof optionsOrTaskFunction === 'function') {
    taskFunction = optionsOrTaskFunction;
    options = {};
  } else {
    options = optionsOrTaskFunction as WatchOptions;
  }

  // Wrapping this function teaches the glob-watcher about how to deal with sync taskFunction
  const wrappedFunction = wrapTask(taskFunction);
  return globWatch(globs, options, wrappedFunction) as FSWatcher;
}
