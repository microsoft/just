const { task, series, parallel } = require('just-task');

require('just-task-preset');

task('build', parallel('typescript'));
task('watch', parallel('typescript:watch'));
