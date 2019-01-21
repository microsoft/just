import { task, option } from 'just-task';
import { addPackageTask } from '../tasks/addPackageTask';
import { upgradeRepoTask } from '../tasks/upgradeRepoTask';

module.exports = function() {
  option('cwd');
  option('name');
  task('add-package', addPackageTask);
  task('upgrade-repo', upgradeRepoTask);
};
