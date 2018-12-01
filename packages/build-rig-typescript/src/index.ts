import { task, series, parallel, logger } from 'build-rig';
import { spawn } from 'child_process';

task('typescript', function() {
  spawn('tsc');
});
