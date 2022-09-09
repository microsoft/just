import { task, series, parallel } from 'just-task';
import {
  cleanTask,
  tscTask,
  jestTask,
  webpackTask,
  webpackDevServerTask,
  defaultCleanPaths,
  tslintTask,
} from '../tasks';

export function webapp(): void {
  task('clean', cleanTask([...defaultCleanPaths(), 'lib-commonjs']));

  task('ts:esm', tscTask({ module: 'esnext', outDir: 'lib' }));
  task('ts:watch', tscTask({ module: 'esnext', outDir: 'lib', watch: true }));
  task('ts', parallel('ts:esm'));

  task('jest', jestTask());
  task('jest:watch', jestTask({ watch: true }));

  task('tslint', tslintTask());

  task('webpack', webpackTask());

  task('webpack:watch', webpackDevServerTask());

  task('build', series('ts', 'webpack'));
  task('test', series('jest'));
  task('start', series('webpack:watch'));
  task('start-test', series('jest:watch'));

  task('rebuild', series('clean', 'build'));
}
