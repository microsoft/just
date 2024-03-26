import { nodeExecTask, tscTask, task, parallel } from 'just-scripts';

task('typescript', tscTask({}));

task('customNodeTask', nodeExecTask({ args: ['./tasks/customTask.js'] }));

task('build', parallel('customNodeTask', 'typescript'));
