import glob from 'glob';
import fs from 'fs';
import path from 'path';
import parallelLimit from 'run-parallel-limit';
import mkdirp from 'mkdirp';
import { logger } from 'just-task';

export function copyTask(paths: string[] = [], dest: string, limit: number = 15) {
  return function copy(done: (err?: Error) => void) {
    logger.info(`Copying [${paths.map(p => path.relative(process.cwd(), p)).join(', ')}] to '${dest}'`);

    if (!fs.existsSync(dest)) {
      mkdirp.sync(dest);
    }

    const copyTasks: parallelLimit.Task<void>[] = [];

    function helper(srcPath: string, basePath: string = '') {
      basePath = basePath || getBasePath(srcPath);
      const matches = glob.sync(srcPath);

      matches.forEach(matchedPath => {
        if (fs.existsSync(matchedPath)) {
          const stat = fs.statSync(matchedPath);
          if (stat.isDirectory()) {
            return helper(path.join(matchedPath, '**/*'), basePath);
          }
        }

        const relativePath = path.relative(basePath, matchedPath);

        copyTasks.push(cb => {
          const readStream = fs.createReadStream(matchedPath);
          const destPath = path.join(dest, relativePath);

          if (!fs.existsSync(path.dirname(destPath))) {
            mkdirp.sync(path.dirname(destPath));
          }

          readStream.pipe(fs.createWriteStream(destPath));
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

  if (fs.existsSync(relativePath)) {
    const stat = fs.statSync(relativePath);

    if (!stat.isDirectory()) {
      return path.dirname(relativePath);
    }
  }

  return relativePath;
}
