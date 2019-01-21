import { task, option } from 'just-task';
import { addPackageTask } from '../tasks/addPackageTask';

module.exports = function() {
  option('cwd');
  option('name');
  task('add-package', addPackageTask);
};
