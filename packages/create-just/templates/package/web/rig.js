const { task, series, parallel } = require('build-rig');

require('build-rig-typescript');
require('build-rig-webpack');

task('build', series('typescript', 'webpack'));
task('watch', parallel('typescript:watch'));
