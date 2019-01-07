---
id: doc-start
title: Getting Started with Just ____
sidebar_label: Getting Started
---

`Just` is a build task definition library. It stands on the shoulders of two excellent and well tested libraries: undertaker and yargs. We encourage developers to make `just` available locally instead of installing `just` as a global tool.

```sh
npm i -D just-task
```

Place some task definitions inside `just-task.js` in your root folder (next to package.json):

```js
const { task, option, logger, argv } = require('just-task');

option('name', { default: 'world' });

task('sayhello', function() {
  logger.info(argv().name);
});
```

Then run it! It is best to either place `just` inside a npm run script or run it with `npx`:

```sh
$ npx just sayhello
$ npx just sayhello --name me
```

That's all!

## Next Steps

Learn about how to [compose tasks in just-task.js](composition.md)
