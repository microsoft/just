import { task, option } from 'just-task';
import { addPackageTask, upgradeRepoTask } from '../tasks';

export function monorepo() {
  option('cwd');
  option('name');
  task('add-package', addPackageTask);
  task('upgrade-repo', upgradeRepoTask);
}
