import * as globWatch from 'glob-watcher';
import * as fs from 'fs';
import { wrapTask } from './wrapTask';
import { TaskFunction } from './interfaces';
import type { WatchOptions } from 'chokidar';

export function watch(
  globs: string | string[],
  optionsOrTaskFunction?: TaskFunction | WatchOptions | undefined,
  taskFunction?: TaskFunction | undefined,
): () => Promise<fs.FSWatcher> {
  let options: WatchOptions = {};
  if (typeof optionsOrTaskFunction === 'function') {
    taskFunction = optionsOrTaskFunction;
    options = {};
  } else {
    options = optionsOrTaskFunction as WatchOptions;
  }

  // Return a taskFunction, so this API can be parallelized
  return () =>
    new Promise((resolve, reject) => {
      // Wrapping this function teaches the glob-watcher about how to deal with sync taskFunction
      const wrappedFunction = wrapTask(taskFunction);
      const watcher = globWatch(globs, options, wrappedFunction);
      watcher.on('close', () => {
        resolve(watcher);
      });
      watcher.on('error', () => {
        reject();
      });
    });
}
