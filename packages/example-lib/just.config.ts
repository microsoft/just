import { nodeExecTask, tscTask, task, parallel } from 'just-scripts';

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

task('customNodeTask', nodeExecTask({ enableTypeScript: true, args: ['./tasks/customTask.ts'] }));

task('build', parallel('customNodeTask', 'typescript'));
task('watch', parallel('typescript:watch'));
