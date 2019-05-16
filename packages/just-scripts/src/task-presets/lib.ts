import { task, series, parallel, option } from 'just-task';
import {
  cleanTask,
  tscTask,
  jestTask,
  upgradeStackTask,
  defaultCleanPaths,
  CleanTaskOptions,
  JestTaskOptions,
  TscTaskOptions
} from '../tasks';

export interface LibPresetOptions {
  clean?: CleanTaskOptions;
  tsCommonjs?: TscTaskOptions;
  tsEsm?: TscTaskOptions;
  tsWatch?: TscTaskOptions;
  jest?: JestTaskOptions;
  jestWatch?: JestTaskOptions;
}

export function lib(options: LibPresetOptions = {}) {
  const { clean = {}, tsCommonjs = {}, tsEsm = {}, tsWatch = {}, jest = {}, jestWatch = {} } = options;
  option('runInBand');

  task('clean', cleanTask({ paths: [...defaultCleanPaths(), 'lib-commonjs'], ...clean }));

  task('ts:commonjs', tscTask({ module: 'commonjs', outDir: 'lib-commonjs', ...tsCommonjs }));
  task('ts:esm', tscTask({ module: 'esnext', outDir: 'lib', ...tsEsm }));
  task('ts:watch', tscTask({ module: 'esnext', outDir: 'lib', ...tsWatch, watch: true }));
  task('ts', parallel('ts:commonjs', 'ts:esm'));

  task('jest', jestTask(jest));
  task('jest:watch', jestTask({ ...jestWatch, watch: true }));

  task('build', series('clean', 'ts', 'jest'));
  task('test', series('clean', 'jest'));
  task('start', series('clean', 'ts:watch'));
  task('start-test', series('clean', 'jest:watch'));

  task('upgrade-stack', upgradeStackTask());
}
