import { task, series, parallel } from 'just-task';
import { cleanTask, tscTask, jestTask, webpackTask, upgradeStackTask, webpackDevServerTask } from '../tasks';

export function webapp() {
  task('clean', cleanTask());

  task('ts:commonjs', tscTask({ module: 'commonjs', outDir: 'lib-commonjs' }));
  task('ts:esm', tscTask({ module: 'esnext', outDir: 'lib' }));
  task('ts:watch', tscTask({ module: 'esnext', outDir: 'lib', watch: true }));
  task('ts', parallel('ts:commonjs', 'ts:esm'));

  task('jest', jestTask());
  task('jest:watch', jestTask({ watch: true }));

  task('webpack', webpackTask());
  task('webpack:watch', webpackDevServerTask());

  task('build', series('clean', 'ts', parallel('jest', 'webpack')));
  task('test', series('clean', 'jest'));
  task('start', series('clean', 'webpack:watch'));
  task('start-test', series('clean', 'jest:watch'));

  task('upgrade-stack', upgradeStackTask);
}
