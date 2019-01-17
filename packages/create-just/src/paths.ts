import path from 'path';

export const paths = {
  get installPath() {
    return process.cwd();
  },

  get repoTemplatePath() {
    return path.resolve(__dirname, '../templates/repo');
  },

  get packageTemplatePath() {
    return path.resolve(__dirname, '../templates/package');
  }
};
