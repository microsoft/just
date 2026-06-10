import type { WatchOptions, FSWatcher } from 'chokidar';
import type { Stats } from 'fs';

type WatchListener = (path: string, stats?: Stats) => void;

export function watch(globs: string | string[], listener?: WatchListener): FSWatcher;
export function watch(globs: string | string[], options?: WatchOptions, listener?: WatchListener): FSWatcher;
export function watch(
  globs: string | string[],
  optionsOrListener?: WatchListener | WatchOptions,
  listener?: WatchListener,
): FSWatcher {
  const chokidar = require('chokidar') as typeof import('chokidar');

  let options: WatchOptions;
  if (typeof optionsOrListener === 'function') {
    listener = optionsOrListener;
    options = {};
  } else {
    options = optionsOrListener as WatchOptions;
  }

  // Wrapping this function teaches the glob-watcher about how to deal with sync taskFunction
  const innerListener = listener || (() => {});
  const watcher = chokidar.watch(globs, { ...options, ignoreInitial: true });
  for (const evt of ['add', 'change', 'unlink']) {
    watcher.on(evt, innerListener);
  }
  return watcher;
}
