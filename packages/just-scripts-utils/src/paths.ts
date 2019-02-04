import path from 'path';
import os from 'os';

let installPath: string = '';

export const paths = {
  get installPath() {
    return installPath || process.cwd();
  },

  set installPath(value: string) {
    installPath = value;
  },

  tempPath(...args: string[]) {
    return path.resolve.apply(null, [os.tmpdir(), 'just-stack', ...args]);
  }
};
