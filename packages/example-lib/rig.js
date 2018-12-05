const { task, series, parallel } = require('just-task');

require('just-task-typescript');
require('just-task-webpack');

task('build', series('typescript', 'webpack'));
task('watch', parallel('typescript:watch'));
