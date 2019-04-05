import { ComposedTasks, composedTasks, Task, ComposedTask, argv } from 'just-task';
import {
  cleanTask,
  tscTask,
  jestTask,
  upgradeStackTask,
  CompilerOptions,
  JestTaskOptions
} from '../tasks';
import { TaskPreset, registerOptions, YargsOptions } from './TaskPreset';

export interface LibTasks extends ComposedTasks {
  clean: Task;
  'ts:commonjs': Task<CompilerOptions>;
  'ts:esm': Task<CompilerOptions>;
  'ts:watch': Task<CompilerOptions>;
  ts: ComposedTask;
  jest: Task<JestTaskOptions>;
  'jest:watch': Task<JestTaskOptions>;
  build: ComposedTask;
  test: ComposedTask;
  start: ComposedTask;
  'start-test': ComposedTask;
  'upgrade-stack': Task;
}

export const lib: TaskPreset<LibTasks> = {
  options(extraOptions: YargsOptions = {}) {
    registerOptions(extraOptions);
    return argv();
  },
  defaultTasks(): LibTasks {
    return {
      clean: { fn: cleanTask },
      'ts:commonjs': { fn: tscTask, params: { module: 'commonjs', outDir: 'lib-commonjs' } },
      'ts:esm': { fn: tscTask, params: { module: 'esnext', outDir: 'lib' } },
      'ts:watch': { fn: tscTask, params: { module: 'esnext', outDir: 'lib', watch: true } },
      ts: { parallel: ['ts:esm', 'ts:watch'] },
      jest: { fn: jestTask },
      'jest:watch': { fn: jestTask, params: { watch: true } },
      build: { series: ['clean', 'ts', 'jest'] },
      test: { series: ['clean', 'jest'] },
      start: { series: ['clean', 'ts:watch'] },
      'start-test': { series: ['clean', 'jest:watch'] },
      'upgrade-stack': { fn: upgradeStackTask }
    };
  },
  register(tasks?: LibTasks) {
    composedTasks(tasks || lib.defaultTasks());
  }
};
