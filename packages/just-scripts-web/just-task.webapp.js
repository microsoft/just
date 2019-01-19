// @ts-check

const { task, series, parallel } = require('just-task');
const { cleanTask, tscTask, jestTask, webpackTask } = require('just-task-preset');

module.exports = function() {
  task('clean', cleanTask());

  task('ts:commonjs', tscTask({ module: 'commonjs', outDir: 'lib-commonjs' }));
  task('ts:esm', tscTask({ module: 'esnext', outDir: 'lib' }));
  task('ts:watch', tscTask({ module: 'esnext', outDir: 'lib', watch: true }));
  task('ts', parallel('ts:commonjs', 'ts:esm'));

  task('jest', jestTask());
  task('jest:watch', jestTask({ watch: true }));

  task('webpack', webpackTask());

  task('build', series('clean', 'ts', parallel('jest', 'webpack')));
  task('test', series('clean', 'jest'));
  task('start', series('clean', 'ts:watch'));
  task('start-test', series('clean', 'jest:watch'));
};
