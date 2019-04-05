import { TaskFunction, task } from './task';
import { parallel, series } from './undertaker';
import { condition } from './condition';

export interface ComposedTasks {
  [taskName: string]: Task | ComposedTask;
}

export interface Task<TParams = {}> {
  fn: (params?: TParams) => TaskFunction;
  params?: TParams;
  description?: string;
}

export type ComposedTask = Parallel | Condition | Series | Task;

export interface Parallel {
  parallel: (ComposedTask | string)[];
}

export interface Series {
  series: (ComposedTask | string)[];
}

export interface Condition {
  name: string;
  condition: () => boolean;
}

/**
 * Register the given set of tasks.
 */
export function composedTasks(tasks: ComposedTasks): void {
  for (let [taskName, taskDef] of Object.entries(tasks)) {
    const processed = processTask(taskDef) as TaskFunction;
    if (isTask(taskDef) && taskDef.description) {
      // handle task with description
      task(taskName, taskDef.description, processed);
    } else {
      task(taskName, processed);
    }
  }
}

function processTask(task: ComposedTask | string): TaskFunction | string {
  if (isParallel(task)) {
    return parallel(...task.parallel.map(processTask));
  } else if (isSeries(task)) {
    return series(...task.series.map(processTask));
  } else if (isCondition(task)) {
    return condition(task.name, task.condition);
  } else if (isTask(task)) {
    return task.fn(task.params);
  }
  return task;
}

export function isParallel(task: ComposedTask | string): task is Parallel {
  return !!(task as Parallel).parallel;
}

export function isSeries(task: ComposedTask | string): task is Series {
  return !!(task as Series).series;
}

export function isCondition(task: ComposedTask | string): task is Condition {
  return !!(task as Condition).condition;
}

export function isTask(task: ComposedTask | string): task is Task {
  return !!(task as Task).fn;
}
