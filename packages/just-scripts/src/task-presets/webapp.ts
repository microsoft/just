import { task, series, parallel } from 'just-task';
import {
  cleanTask,
  tscTask,
  jestTask,
  webpackTask,
  upgradeStackTask,
  webpackDevServerTask
} from '../tasks';

/**
 * Register tasks for building a webapp.
 *
 * @param webpackModule Webpack module (`import webpack from 'webpack'`). This is needed because
 * just-scripts does not take a (non-dev) dependency on or bundle webpack.
 */
export function webapp(webpackModule: any) {
  task('clean', cleanTask());

  task('ts:commonjs', tscTask({ module: 'commonjs', outDir: 'lib-commonjs' }));
  task('ts:esm', tscTask({ module: 'esnext', outDir: 'lib' }));
  task('ts:watch', tscTask({ module: 'esnext', outDir: 'lib', watch: true }));
  task('ts', parallel('ts:commonjs', 'ts:esm'));

  task('jest', jestTask());
  task('jest:watch', jestTask({ watch: true }));

  task('webpack', webpackTask(webpackModule));
  task('webpack:watch', webpackDevServerTask());

  task('build', series('clean', 'ts', parallel('jest', 'webpack')));
  task('test', series('clean', 'jest'));
  task('start', series('clean', 'webpack:watch'));
  task('start-test', series('clean', 'jest:watch'));

  task('upgrade-stack', upgradeStackTask());
}
