import { nodeExecTask, task } from 'just-scripts';

task('test', nodeExecTask({ args: ['./customTask.mjs'] }));
