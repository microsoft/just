import yargs from 'yargs';
import { option } from 'just-task';

export interface TaskOptions {
  [argName: string]: any;
}

export interface YargsOptions {
  /** Mapping from option name to option settings (if any) */
  [key: string]: yargs.Options | undefined;
}

export interface TaskPreset<Tasks, Options = TaskOptions> {
  /**
   * Get the default set of composed tasks for this preset. The keys should match `taskNames`.
   *
   * Because this method returns a new object each time, you can modify the result to customize
   * your task definitions. Then pass it to `register` to register the tasks.
   */
  defaultTasks(): Tasks;

  /**
   * Register any default options plus the given options, and return the value of argv().
   */
  options(extraOptions?: YargsOptions): Options;

  /**
   * Actually register the tasks from the preset.
   * @param tasks Optional override task definitions
   */
  register(tasks?: Tasks): void;
}

export function registerOptions(options: YargsOptions) {
  for (let [key, settings] of Object.entries(options)) {
    option(key, settings);
  }
}
