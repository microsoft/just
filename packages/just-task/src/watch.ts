import type { WatchOptions, FSWatcher } from 'chokidar';
import type { Stats } from 'fs';

type WatchListener = (path: string, stats?: Stats) => void;

export function watch(
  globs: string | string[],
  optionsOrListener?: WatchListener | WatchOptions,
  listener?: WatchListener,
): FSWatcher {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const chokidar = require('chokidar');

  let options: WatchOptions;
  if (typeof optionsOrListener === 'function') {
    listener = optionsOrListener;
    options = {};
  } else {
    options = optionsOrListener as WatchOptions;
  }

  options = { ...options, ignoreInitial: true };

  // Wrapping this function teaches the glob-watcher about how to deal with sync taskFunction
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const innerListener = listener!;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const watcher = chokidar.watch(globs, options) as FSWatcher;
  for (const evt of ['add', 'change', 'unlink']) {
    watcher.on(evt, innerListener);
  }
  return watcher;
}
