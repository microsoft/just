const { task, series, parallel } = require('build-rig');

import 'build-rig-typescript';

task('build', series('typescript'));
