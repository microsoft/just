import { Task, ComposedTask, argv, composedTasks } from 'just-task';
import {
  webpackTask,
  webpackDevServerTask,
  CompilerOptions,
  JestTaskOptions,
  WebpackTaskOptions
} from '../tasks';
import { YargsOptions, registerOptions, TaskPreset } from './TaskPreset';
import { LibTasks, lib } from './lib';

export interface WebappTasks extends LibTasks {
  clean: Task;
  'ts:commonjs': Task<CompilerOptions>;
  'ts:esm': Task<CompilerOptions>;
  'ts:watch': Task<CompilerOptions>;
  ts: ComposedTask;
  jest: Task<JestTaskOptions>;
  'jest:watch': Task<JestTaskOptions>;
  webpack: Task<WebpackTaskOptions>;
  'webpack:watch': Task<WebpackTaskOptions>;
  build: ComposedTask;
  test: ComposedTask;
  start: ComposedTask;
  'start-test': ComposedTask;
  'upgrade-stack': Task;
}

export const webapp: TaskPreset<WebappTasks> = {
  options(extraOptions: YargsOptions = {}) {
    registerOptions(extraOptions);
    return argv();
  },
  defaultTasks(): WebappTasks {
    return {
      ...lib.defaultTasks(),
      webpack: { fn: webpackTask },
      'webpack:watch': { fn: webpackDevServerTask },
      build: { series: ['clean', 'ts', { parallel: ['jest', 'webpack'] }] },
      start: { series: ['clean', 'webpack:watch'] }
    };
  },
  register(tasks?: WebappTasks) {
    composedTasks(tasks || webapp.defaultTasks());
  }
};
