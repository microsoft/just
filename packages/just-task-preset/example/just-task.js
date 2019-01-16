// @ts-check

const { task, parallel } = require('just-task');
const { tscTask, copyTask, jestTask, outdatedTask, selfUpdateTask } = require('../lib/index');

//task('build', parallel(tscTask(), tscTask()));
task('ts', tscTask({}));

task(
  'build',
  parallel(() => {
    return copyTask([], '');
  })
);

task('test', jestTask());
task('start-test', jestTask({ watch: true }));

const spec = {
  versionSpec: {
    'just-task': 'latest',
    'office-ui-fabric-react': '>=6.0.0 <7.0.0'
  }
};

task('outdated', outdatedTask(spec));
task('selfupdate', selfUpdateTask(spec));
