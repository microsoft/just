// Sample just.config.ts file which is fully type checked

import { logger, parallel, series, task, watch } from 'just-task';
import { tscTask } from '../tscTask';
import { nodeExecTask } from '../nodeExecTask';

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

task('customNodeTask', nodeExecTask({ enableTypeScript: true, args: ['./tasks/customTask.ts'] }));

task('bundle', () => {
  const someVar = Math.random();

  return done => {
    logger.info('fake bundle', someVar);
    setTimeout(() => {
      done();
    }, 100);
  };
});

task('bundle:promise', () => {
  return () => {
    return new Promise(resolve => {
      logger.info('fake promise bundling files');
      setTimeout(() => {
        resolve(undefined);
      }, 100);
    });
  };
});

task('bundle:promise:fail', () => {
  const someVar = Math.random();

  return () =>
    new Promise((_resolve, reject) => {
      logger.info('fake promise bundling files', someVar);
      setTimeout(() => {
        reject(new Error('adsfadsf'));
      }, 100);
    });
});

task('build', 'description', series(parallel('customNodeTask', 'typescript'), 'bundle'));
task('watch', parallel('typescript:watch'));

task(
  'start',
  parallel(
    () =>
      watch(['./src/**/*.js'], () => {
        console.log('dude js');
      }),
    () =>
      watch(['./src/**/*.ts'], () => {
        console.log('dude ts');
      }),
  ),
);

task('w', () => {
  const watcher = watch(['./src/**/*.js']);
  watcher.on('change', (evt, file) => {
    console.log(file, 'is changed', evt);
  });
});
