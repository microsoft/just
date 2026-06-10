# Jest

Jest is one of the most popular testing libraries in the Javascript ecosystem. It is also a preset supported out of the box inside the `just-scripts` library. Similar to the other presets, this task function assumes that you have a `jest.config.js` at the root of the project.

```ts
// just.config.ts
import { jestTask } from 'just-scripts';
task('test', jestTask());
```

You can pass in a few options like any another preset tasks in the `just-scripts` library.

```ts
// just.config.ts
import { jestTask } from 'just-scripts';

const options = {
  runInBand: true,
};

task('test', jestTask(options));
```

## Available options

See the types for a complete list of options, including `config` to customize the config file path, and various common Jest options.
