---
id: scripts-jest
title: Jest
sidebar_label: Jest
---

Jest is one of the most popular testing libraries in the Javascript ecosystem. It is also a preset supported out of the box inside the `just-scripts` library. Similar to the other presets, this task function assumes that you have a `jest.config.js` at the root of the project.

```tsx
// just-task.js
import { jestTask } from 'just-scripts';
task('test', jestTask());
```

You can pass in a few options like any another preset tasks in the `just-scripts` library.

```tsx
// just-task.js
import { jestTask } from 'just-scripts';

const options = {
  runInBand: true
};

task('test', jestTask(options));
```

## Available Options

### config

You can pass in a different `jest.config.js` file to the `jestTask()`.

### runInBand

This causes the `jest` runner to run the tests in a single thread.

### coverage

This causes `jest` to collect coverage information. It is much slower, and therefore is turned OFF by default.

### updateSnapshots

This causes the `jestTask()` to update snapshots. Configuration of the snapshot location is subject to the `jest.config.js` file.
