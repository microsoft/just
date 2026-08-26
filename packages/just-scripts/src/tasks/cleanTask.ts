import fse from 'fs-extra';
import path from 'path';
import type { TaskFunction } from 'just-task';
import { logger } from 'just-task';

export interface CleanTaskOptions {
  /**
   * Paths to clean
   * @default ['lib', 'temp', 'dist', 'coverage']
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

export function cleanTask(options?: CleanTaskOptions): TaskFunction {
  const { paths = defaultCleanPaths(), limit = 5 } = options || {};

  return async function clean() {
    logger.info(`Removing [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}]`);

    // p-limit is ESM and must be async imported from CJS
    const pLimit = (await import('p-limit')).default;
    const limiter = pLimit(limit);

    await Promise.all(paths.map(cleanPath => limiter(() => fse.remove(cleanPath))));
  };
}
