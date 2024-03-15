import { nodeExecTask, tscTask, task, parallel } from 'just-scripts';

task('typescript', tscTask({}));

task('customNodeTask', nodeExecTask({ enableTypeScript: 'esm', args: ['./tasks/customTask.ts'] }));

task('build', parallel('customNodeTask', 'typescript'));
