import { nodeExecTask, tscTask, task, parallel, watch } from 'just-scripts';

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

task('customNodeTask', nodeExecTask({ enableTypeScript: true, args: ['./tasks/customTask.ts'] }));

task('build', parallel('customNodeTask', 'typescript'));
task('watch', parallel('typescript:watch'));

task('start', () => {
  return parallel(
    () =>
      watch(['./src/**/*.js'], () => {
        console.log('dude js');
      }),
    () =>
      watch(['./src/**/*.ts'], () => {
        console.log('dude ts');
      }),
  );
});

task('w', () => {
  const watcher = watch(['./src/**/*.js']);
  watcher.on('change', (evt, file) => {
    console.log(file, 'is changed', evt);
  });
});
