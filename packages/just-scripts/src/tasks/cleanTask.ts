import * as fse from 'fs-extra';
import * as path from 'path';
import { logger, TaskFunction, clearCache } from 'just-task';
import pLimit from 'p-limit';

export interface CleanTaskOptions {
  /**
   * Paths to clean
   * @default defaultCleanPaths()
   */
  paths?: string[];
  /**
   * Limit on number of simultaneous cleaning tasks
   * @default 5
   */
  limit?: number;
}

export function defaultCleanPaths(): string[] {
  return ['lib', 'temp', 'dist', 'coverage'];
}

export function cleanTask(options?: CleanTaskOptions): TaskFunction;
/** @deprecated Use object param version */
export function cleanTask(paths?: string[], limit?: number): TaskFunction;
export function cleanTask(pathsOrOptions: string[] | CleanTaskOptions = {}, limit?: number): TaskFunction {
  let paths: string[];
  if (Array.isArray(pathsOrOptions)) {
    paths = pathsOrOptions;
  } else {
    paths = pathsOrOptions.paths || defaultCleanPaths();
    limit = limit || pathsOrOptions.limit;
  }
  limit = limit || 5;

  return async function clean() {
    logger.info(`Removing [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}]`);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const limiter = pLimit(limit!);
    const cleanTasks = paths.map(cleanPath => limiter(() => fse.remove(cleanPath)));
    cleanTasks.push(limiter(async () => clearCache()));
    await Promise.all(cleanTasks);
  };
}
