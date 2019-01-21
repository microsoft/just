import path from 'path';
import os from 'os';

export const paths = {
  get installPath() {
    return process.cwd();
  },

  tempPath(...args: string[]) {
    return path.resolve.apply(null, [os.tmpdir(), 'just-stack', ...args]);
  }
};
