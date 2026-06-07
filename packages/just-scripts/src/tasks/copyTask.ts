import { sync as globSync } from 'glob';
import fse from 'fs-extra';
import path from 'path';
import type { TaskFunction } from 'just-task';
import { logger } from 'just-task';
import parallelLimit from 'run-parallel-limit';

export interface CopyTaskOptions {
  /**
   * Paths to copy (can contain glob patterns).
   * Any glob patterns **must** use forward slashes as separators, even on Windows.
   */
  paths?: string[];
  /** Destination directory */
  dest: string;
  /**
   * Limit on number of simultaneous copying tasks
   * @default 15
   */
  limit?: number;
}

export function copyTask(options: CopyTaskOptions): TaskFunction {
  const { paths, dest, limit = 15 } = options;

  return function copy(done) {
    if (!paths?.length) {
      done();
      return;
    }

    logger.info(`Copying [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}] to '${dest}'`);

    fse.mkdirpSync(dest);

    const copyTasks: parallelLimit.Task<void>[] = [];

    function helper(srcGlob: string, basePath: string) {
      const matches = globSync(srcGlob);

      for (const matchedPath of matches) {
        const stat = fse.statSync(matchedPath);
        if (stat.isDirectory()) {
          // As of glob v8, `\` is only an escape character in patterns, never a path separator. On
          // Windows, glob returns matches with `\` separators, so build the recursive pattern with
          // `/` to avoid producing a pattern where the separators are treated as escapes.
          helper(`${matchedPath.replace(/\\/g, '/')}/**/*`, basePath);
          continue;
        }

        const relativePath = path.relative(basePath, matchedPath);

        copyTasks.push(cb => {
          const readStream = fse.createReadStream(matchedPath);
          const destPath = path.join(dest, relativePath);

          fse.mkdirpSync(path.dirname(destPath));

          readStream.pipe(fse.createWriteStream(destPath));
          readStream.on('error', err => cb(err));
          readStream.on('end', () => cb(null));
        });
      }
    }

    for (let copyPath of paths) {
      if (process.platform === 'win32' && fse.existsSync(copyPath)) {
        // On Windows, normalize any literal paths to use forward slashes. This normalization isn't
        // safe for globs because `\` might be present as an escape character.
        copyPath = copyPath.replace(/\\/g, '/');
      }
      helper(copyPath, getBasePath(copyPath));
    }

    parallelLimit(copyTasks, limit, done);
  };
}

/**
 * @param pattern MUST use forward slashes for path separators
 */
function getBasePath(pattern: string) {
  const parts = path.resolve(pattern).split('/');
  const relativePathParts: string[] = [];

  for (const part of parts) {
    if (part.startsWith('*')) {
      break;
    }
    relativePathParts.push(part);
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
