import {
  nodeExecTask,
  tscTask,
  task,
  parallel,
  watch,
  jestTask,
  eslintTask,
  apiExtractorVerifyTask,
  apiExtractorUpdateTask,
  logger,
  series,
} from 'just-scripts';

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

task('customNodeTask', nodeExecTask({ enableTypeScript: true, args: ['./tasks/customTask.ts'] }));

task('bundle', () => {
  const someVar = Math.random();

  return done => {
    logger.info('fake bundle', someVar);
    setTimeout(done, 50);
  };
});

task('bundle:promise', () => {
  return () =>
    new Promise(resolve => {
      logger.info('fake promise bundling files');
      setTimeout(resolve, 50);
    });
});

task('build', 'description', series(parallel('customNodeTask', 'typescript'), 'bundle', 'bundle:promise'));
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

task('test', jestTask());

task('lint', eslintTask());

task('api', apiExtractorVerifyTask({}));
task('api:update', apiExtractorUpdateTask({}));
