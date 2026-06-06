// Sample just.config.ts file which is fully type checked

import { parallel, task, watch } from 'just-task';
import { tscTask } from '../tscTask';
import { nodeExecTask } from '../nodeExecTask';

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

task('customNodeTask', nodeExecTask({ enableTypeScript: true, args: ['./tasks/customTask.ts'] }));

task('build', 'description', parallel('customNodeTask', 'typescript'));
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
