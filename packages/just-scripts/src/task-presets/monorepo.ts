import { task, option } from 'just-task';
import { addPackageTask, upgradeRepoTask } from '../tasks';

export function monorepo() {
  option('cwd');
  option('name');
  option('latest');
  task('add-package', 'adds a package to the monorepo', addPackageTask);
  task(
    'upgrade-repo',
    'upgrades packages inside the monorepo according to the just-stack template',
    upgradeRepoTask
  );
}
