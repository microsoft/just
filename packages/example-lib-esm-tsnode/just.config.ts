import { nodeExecTask, tscTask, task, parallel } from 'just-scripts';

task('typescript', tscTask({}));

task(
  'customNodeTask',
  nodeExecTask({
    enableTypeScript: 'esm',
    transpileOnly: true,
    args: ['./tasks/customTask.ts'],
  }),
);

task('build', parallel('customNodeTask', 'typescript'));
