---
id: condition
title: Controlling Task Flow with Conditionals
sidebar_label: Conditionals
---

Sometimes a `just.config.js` includes tasks that are skipped depending on the arguments that are given. Use a `condition()` function to decide to run a task or to skip it.

## Running tasks in a series

As we have seen, tasks can be run in a series.

```js
const { task, series } = require('just-task');

task('clean', function () {
  // clean stuff
});

task('babel', function () {
  // run babel over some files
});

task('test', function () {
  // run babel over some files
});

task('build', series('clean', 'babel', 'test'));
```

We can conditionally skip the `test` task by some argument like `--skip-test`

```js
const { task, series, option, argv, condition } = require('just-task');

// First define a 'skip-test' option
option('skip-test');

task('clean', function () {
  // clean stuff
});

task('babel', function () {
  // run babel over some files
});

task('test', function () {
  // run babel over some files
});

task(
  'build',
  series(
    'clean',
    'babel',
    condition('test', () => !argv()['skip-test']),
  ),
);
```

Now you can skip the test task by passing an argument like this:

```sh
$ just build --skip-test
```
