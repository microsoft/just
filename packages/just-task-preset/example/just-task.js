// @ts-check

const { task, parallel, thunk } = require('just-task');
const { tscTask, copyTask, outdatedTask, selfUpdateTask } = require('../lib/index');

//task('build', parallel(tscTask(), tscTask()));
task('ts', tscTask({}));

task(
  'build',
  parallel(() => {
    return copyTask([], '');
  })
);

const spec = {
  versionSpec: {
    'just-task': 'latest',
    'office-ui-fabric-react': '>=6.0.0 <7.0.0'
  }
};

task('outdated', outdatedTask(spec));
task('selfupdate', selfUpdateTask(spec));
