import glob from 'glob';
import fse from 'fs-extra';
import path from 'path';
import parallelLimit from 'run-parallel-limit';
import { logger } from 'just-task';
import { TaskFunction } from 'just-task/lib/task';

export function copyTask(paths: string[] = [], dest: string, limit: number = 15): TaskFunction {
  return function copy(done: (err?: Error) => void) {
    logger.info(
      `Copying [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}] to '${dest}'`
    );

    if (!fse.existsSync(dest)) {
      fse.mkdirpSync(dest);
    }

    const copyTasks: parallelLimit.Task<void>[] = [];

    function helper(srcPath: string, basePath: string = '') {
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
          const destPath = path.join(dest, relativePath);

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
    parallelLimit(copyTasks, limit, done);
  };
}

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
