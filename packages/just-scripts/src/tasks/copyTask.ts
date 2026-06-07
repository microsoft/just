import { sync as globSync, hasMagic } from 'glob';
import fse from 'fs-extra';
import path from 'path';
import { pipeline } from 'stream';
import type { TaskFunction } from 'just-task';
import { logger } from 'just-task';
import parallelLimit from 'run-parallel-limit';

export interface CopyTaskOptions {
  /**
   * Paths to copy (can contain glob patterns).
   * Any glob patterns **must** use forward slashes as separators, even on Windows.
   *
   * Each matched file is copied to `dest` at a location mirroring its path relative to the "base"
   * of its pattern. The base is the portion of the pattern up to (but not including) the first
   * segment containing glob magic (`*`, `?`, `[...]`, `{...}`). In other words, only the segments
   * at or after the first magic segment are recreated as directories under `dest`; the literal
   * prefix is not. For example:
   * - `src/a.txt` (literal file) is copied directly into `dest` with no extra directories
   *   (`dest/a.txt`).
   * - `src` (literal directory) is copied recursively, preserving its internal structure under
   *   `dest` (a file `src/sub/a.txt` becomes `dest/sub/a.txt`).
   * - `assets/img/*.png` copies matches directly into `dest` (`dest/a.png`), since the literal
   *   prefix `assets/img` is the base.
   * - `src/* /a.txt` (remove the extra space) keeps the wildcard segment and everything after it,
   *   so `src/sub/a.txt` becomes `dest/sub/a.txt`.
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
      // Return absolute paths to ensure path.relative(basePath, matchedPath) works
      const matches = globSync(srcGlob, { absolute: true });

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
          const destPath = path.join(dest, relativePath);

          fse.mkdirpSync(path.dirname(destPath));

          // Use `pipeline` rather than wiring up `pipe`/`end`/`error` manually: it invokes the
          // callback exactly once, only after the destination has been fully flushed and closed
          // (not merely when the source finishes reading), and destroys both streams on error so
          // no file descriptors or partial destination files are leaked.
          pipeline(fse.createReadStream(matchedPath), fse.createWriteStream(destPath), err => cb(err || null));
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
 * Get the base path for a pattern or path. To preserve previous behavior, the base is defined as
 * the portion of the path up to the first segment containing glob magic, or its parent if that
 * segment is a file.
 *
 * @param pattern MUST use forward slashes for path separators
 * @returns absolute path (with OS separators)
 */
function getBasePath(pattern: string) {
  // Previously this used path.resolve(pattern) which would cause issues with backslashes
  // used as escape chars. This logic accomplishes the same goal.
  const parts = path.isAbsolute(pattern)
    ? pattern.split('/')
    : [...process.cwd().split(path.sep), ...pattern.split('/')];
  const basePathParts: string[] = [];

  for (const part of parts) {
    // Stop at the first segment containing glob magic (`*`, `?`, `[...]`, `{...}`). Checking for
    // magic per-segment (rather than just a leading `*`) ensures patterns like `dir/file*.txt`
    // resolve their base to `dir`, so matched files land directly in `dest` instead of escaping it.
    if (hasMagic(part, { magicalBraces: true })) {
      break;
    }
    basePathParts.push(part);
  }

  const basePath = basePathParts.join(path.sep);

  if (fse.existsSync(basePath)) {
    const stat = fse.statSync(basePath);

    if (!stat.isDirectory()) {
      return path.dirname(basePath);
    }
  }

  return basePath;
}
