import type { WatchOptions, FSWatcher } from 'chokidar';
import type { Stats } from 'fs';

type WatchListener = (path: string, stats?: Stats) => void;

export function watch(
  globs: string | string[],
  optionsOrListener?: WatchListener | WatchOptions | undefined,
  listener?: WatchListener | undefined,
): FSWatcher {
  const chokidar = require('chokidar');

  let options: WatchOptions = {};
  if (typeof optionsOrListener === 'function') {
    listener = optionsOrListener;
    options = {};
  } else {
    options = optionsOrListener as WatchOptions;
  }

  options = { ...options, ignoreInitial: true };

  // Wrapping this function teaches the glob-watcher about how to deal with sync taskFunction
  const innerListener = listener!; // eslint-disable-line
  const watcher = chokidar.watch(globs, options) as FSWatcher;
  for (const evt of ['add', 'change', 'unlink']) {
    watcher.on(evt, innerListener);
  }
  return watcher;
}
