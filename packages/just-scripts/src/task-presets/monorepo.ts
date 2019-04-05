import { Task, ComposedTasks, argv, composedTasks } from 'just-task';
import { addPackageTask, upgradeRepoTask } from '../tasks';
import { TaskOptions, YargsOptions, registerOptions, TaskPreset } from './TaskPreset';

export interface MonorepoTasks extends ComposedTasks {
  'add-package': Task;
  'upgrade-repo': Task;
}

export interface MonorepoOptions extends TaskOptions {
  cwd: string;
  name: string;
  latest: string;
}

let _optionsRegistered = false;

export const monorepo: TaskPreset<MonorepoTasks, MonorepoOptions> = {
  options(extraOptions: YargsOptions = {}) {
    if (!_optionsRegistered) {
      registerOptions({
        cwd: undefined,
        name: undefined,
        latest: undefined,
        ...extraOptions
      });
      _optionsRegistered = true;
    }
    return argv() as any;
  },
  defaultTasks(): MonorepoTasks {
    return {
      'add-package': {
        description: 'adds a package to the monorepo',
        fn: addPackageTask
      },
      'upgrade-repo': {
        description: 'upgrades packages inside the monorepo according to the just-stack template',
        fn: upgradeRepoTask
      }
    };
  },
  register(tasks?: MonorepoTasks) {
    if (!_optionsRegistered) {
      monorepo.options();
    }
    composedTasks(tasks || monorepo.defaultTasks());
  }
};
