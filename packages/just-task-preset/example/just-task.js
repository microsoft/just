// @ts-check

const { task, parallel, thunk } = require('just-task');
const { tscTask, copyTask } = require('../lib/index');

//task('build', parallel(tscTask(), tscTask()));
task('ts', tscTask({}));

task(
  'build',
  parallel(
    thunk(() => {
      return copyTask([], '');
    })
  )
);
