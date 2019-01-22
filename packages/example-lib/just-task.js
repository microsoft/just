const { task, parallel } = require('just-task');
const { tscTask } = require('just-scripts');

task('typescript', tscTask({}));
task('typescript:watch', tscTask({ watch: true }));

task('build', parallel('typescript'));
task('watch', parallel('typescript:watch'));
