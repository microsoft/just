import { task, series, parallel, logger } from 'just-task';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import resolve from 'resolve';

task('typescript', function(done) {
  const typescriptPath = resolve.sync('typescript', { basedir: __dirname, preserveSymlinks: true });
  const tscCmd = path.resolve(path.dirname(typescriptPath), 'tsc.js');

  this.logger.info(`Running ${tscCmd}`);

  const cp = spawn(process.execPath, [tscCmd], { stdio: 'inherit' });

  cp.on('exit', code => {
    if (code !== 0) {
      return done('Error in typescript');
    }

    done();
  });
});

task('typescript:watch', function(done) {
  const typescriptPath = resolve.sync('typescript', { basedir: __dirname, preserveSymlinks: true });
  const tscCmd = path.resolve(path.dirname(typescriptPath), 'tsc.js');

  this.logger.info(`Running ${tscCmd} in watch mode`);

  const cp = spawn(process.execPath, [tscCmd, '-w', '--preserveWatchOutput'], { stdio: 'pipe' });

  cp.stdout.on('data', data => {
    this.logger.info(data.toString().trim());
  });

  cp.on('exit', code => {
    if (code !== 0) {
      return done('Error in typescript');
    }

    done();
  });
  return;
});
