const { nodeExecTask, task } = require('just-scripts');

task('test', nodeExecTask({ args: ['./tasks/customTask.mjs'] }));
