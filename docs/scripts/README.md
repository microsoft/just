---
id: scripts
title: Just Scripts
sidebar_label: Just Scripts
---

Unlike other build libraries, Just strives to be useful from the beginning. You can choose to write your own tasks that call other Node.js tools like TypeScript, jest, and webpack. However, Just includes some script functions to get you up and running immediately. The included tasks are enough to have a very productive environment without dictating a certain stack to be used with Just.

> NOTE: even though `just-scripts` interacts with `typescript`, it does not take `typescript` as a dependency. It assumes that the developers will include that in their own projects. This gives `just-scripts` the flexibility of targeting many different versions of individual build tools without imposing a version on the consumers.

These scripts are coded as higher order task functions. Each of these script functions return a task function to be registered as a task in your own `just-task.js` like this:

```ts
// just-task.js
import { tscTask } from 'just-scripts';
task('ts', tscTask());
```

Generally, these higher order functions also take an `options` argument to generate a specific task function preconfigured according to the options. For example:

```ts
// just-task.js
import { tscTask } from 'just-scripts';
task('ts:commonjs', tscTask({ module: 'commonjs' }));
task('ts:esnext', tscTask({ module: 'esnext' }));
```

Something like this will give you two separate TypeScript compilation task functions that produce different kinds of module output format.
