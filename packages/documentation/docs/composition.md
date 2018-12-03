---
id: composition
title: Composition of Tasks
sidebar_label: Composition of Tasks
---

# Composition of Tasks

Once a project get to be a bit more complex, a build step might consist of multiple sub tasks. This can be achieved with composition. This is the main reason `build-rig` is made. It simplifies the composition of tasks.

## Running tasks in a series

```js
// rig.js

const { task, series } = require('build-rig');

task('clean', function() {
  // clean stuff
});

task('babel', function() {
  // run babel over some files
});

task('build', series('clean', 'babel'));
```

When you trigger `rig build`, the `clean` task will run and complete before `babel` task is run.

## Runny tasks in parallel

To take advantage of multi-core CPUs on our machines, we can run several tasks in parallel. Simply use the `parallel()` function.

```js
// rig.js

const { task, parallel } = require('build-rig');

task('babel', function() {
  // run babel babel over some files
});

task('lint', function() {
  // run eslint over some files
});

task('build', parallel('babel', 'lint'));
```

## Nesting tasks in series and parallel

The most powerful feature of `build-rig` is its ability to compose tasks by nesting tasks in series and parallel. Let's combine the previous examples.

```js
// rig.js

const { task, parallel, series } = require('build-rig');

task('babel', function() {
  // run babel babel over some files
});

task('lint', function() {
  // run eslint over some files
});

task('build', series('clean', parallel('babel', 'lint')));
```

## Next Steps

Learn about Logging
