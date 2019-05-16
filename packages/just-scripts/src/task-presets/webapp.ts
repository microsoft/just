import { task, series, parallel } from 'just-task';
import {
  cleanTask,
  tscTask,
  jestTask,
  webpackTask,
  webpackDevServerTask,
  upgradeStackTask,
  defaultCleanPaths,
  CleanTaskOptions,
  TscTaskOptions,
  JestTaskOptions,
  WebpackTaskOptions
} from '../tasks';

export interface WebappPresetOptions {
  clean?: CleanTaskOptions;
  tsCommonjs?: TscTaskOptions;
  tsEsm?: TscTaskOptions;
  tsWatch?: TscTaskOptions;
  jest?: JestTaskOptions;
  jestWatch?: JestTaskOptions;
  webpack?: WebpackTaskOptions;
  webpackWatch?: WebpackTaskOptions;
}

export function webapp(options: WebappPresetOptions = {}) {
  const { clean = {}, tsCommonjs = {}, tsEsm = {}, tsWatch = {}, jest = {}, jestWatch = {} } = options;
  const { webpack = {}, webpackWatch = {} } = options;

  task('clean', cleanTask({ paths: [...defaultCleanPaths(), 'lib-commonjs'], ...clean }));

  task('ts:commonjs', tscTask({ module: 'commonjs', outDir: 'lib-commonjs', ...tsCommonjs }));
  task('ts:esm', tscTask({ module: 'esnext', outDir: 'lib', ...tsEsm }));
  task('ts:watch', tscTask({ module: 'esnext', outDir: 'lib', ...tsWatch, watch: true }));
  task('ts', parallel('ts:commonjs', 'ts:esm'));

  task('jest', jestTask(jest));
  task('jest:watch', jestTask({ ...jestWatch, watch: true }));

  task('webpack', webpackTask(webpack));
  task('webpack:watch', webpackDevServerTask(webpackWatch));

  task('build', series('clean', 'ts', parallel('jest', 'webpack')));
  task('test', series('clean', 'jest'));
  task('start', series('clean', 'webpack:watch'));
  task('start-test', series('clean', 'jest:watch'));

  task('upgrade-stack', upgradeStackTask());
}
