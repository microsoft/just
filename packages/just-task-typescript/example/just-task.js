const { task, parallel } = require('just-task');
const { tscTask } = require('../lib/tscTask');

//task('build', parallel(tscTask(), tscTask()));
task('ts', tscTask());

task('build', parallel('ts'));
