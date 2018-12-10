---
id: thunk
title: Higher Order Task Functions
sidebar_label: Higher Order Task Functions
---

When a project truly gets big enough to have multiple variants of a build, a simple task function might be reused as variants. For example, the `just-task-preset` package includes useful collection of task functions like `tscTask`. However, these tasks tend of be very generic. `tscTask()` is a task function factory. Calling it will generate a task function. But sometimes a preconfigured task function is needed. We will use a concept called `thunk` to create a task function that creates a task function on the fly!

Here is an example of a simple usage of a preset task function factory:

```js
const { task } = require('just-task');
const { tscTask } = require('just-task-preset');

task('build', tscTask());
```

Now, let's try to preconfigure this task based on something we can pass in from the arguments:

```js
const { task, argv, option, thunk } = require('just-task');
const { tscTask } = require('just-task-preset');

option('amd')

task('build', thunk(() => {
  tscTask({ module: argv().amd ? 'amd' : 'commonjs' }))
});
```

Now the build task can take in an argument and perform Typescript compilation for different modes:

```sh
$ just build --amd
$ just build --commonjs
```
