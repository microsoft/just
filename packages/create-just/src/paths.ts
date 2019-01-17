import path from 'path';

export const paths = {
  get installPath() {
    return process.cwd();
  },

  templatePath(...args: string[]) {
    return path.resolve.apply(null, [__dirname, '../templates', ...args]);
  }
};
