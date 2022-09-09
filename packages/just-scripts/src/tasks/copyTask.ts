import * as glob from 'glob';
import * as fse from 'fs-extra';
import * as path from 'path';
import { logger, TaskFunction } from 'just-task';
import parallelLimit = require('run-parallel-limit');

export interface CopyTaskOptions {
  /** Paths to copy */
  paths?: string[];
  /** Destination directory */
  dest: string;
  /**
   * Limit on number of simultaneous copying tasks
   * @default 15
   */
  limit?: number;
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function copyTask(options: CopyTaskOptions): TaskFunction;
/** @deprecated Use object param version */
export function copyTask(paths: string[] | undefined, dest: string, limit?: number): TaskFunction;
export function copyTask(
  optionsOrPaths: CopyTaskOptions | string[] | undefined,
  dest?: string,
  limit?: number,
): TaskFunction {
  let paths: string[] = [];
  if (Array.isArray(optionsOrPaths)) {
    paths = optionsOrPaths;
  } else if (optionsOrPaths) {
    paths = optionsOrPaths.paths || [];
    dest = optionsOrPaths.dest;
    limit = optionsOrPaths.limit;
  }
  limit = limit || 15;

  return function copy(done: (err?: Error) => void) {
    logger.info(`Copying [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}] to '${dest}'`);

    if (!fse.existsSync(dest!)) {
      fse.mkdirpSync(dest!);
    }

    const copyTasks: parallelLimit.Task<void>[] = [];

    function helper(srcPath: string, basePath = '') {
      basePath = basePath || getBasePath(srcPath);
      const matches = glob.sync(srcPath);

      matches.forEach(matchedPath => {
        if (fse.existsSync(matchedPath)) {
          const stat = fse.statSync(matchedPath);
          if (stat.isDirectory()) {
            return helper(path.join(matchedPath, '**/*'), basePath);
          }
        }

        const relativePath = path.relative(basePath, matchedPath);

        copyTasks.push(cb => {
          const readStream = fse.createReadStream(matchedPath);
          const destPath = path.join(dest!, relativePath);

          if (!fse.existsSync(path.dirname(destPath))) {
            fse.mkdirpSync(path.dirname(destPath));
          }

          readStream.pipe(fse.createWriteStream(destPath));
          readStream.on('error', err => cb(err));
          readStream.on('end', cb);
        });
      });
    }

    paths.forEach(copyPath => helper(copyPath));
    parallelLimit(copyTasks, limit!, done);
  };
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

function getBasePath(pattern: string) {
  const parts = path.resolve(pattern).split(/[\/\\]/g);
  const relativePathParts = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith('*')) {
      break;
    }

    relativePathParts.push(parts[i]);
  }

  const relativePath = relativePathParts.join(path.sep);

  if (fse.existsSync(relativePath)) {
    const stat = fse.statSync(relativePath);

    if (!stat.isDirectory()) {
      return path.dirname(relativePath);
    }
  }

  return relativePath;
}
