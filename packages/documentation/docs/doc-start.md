---
id: doc-start
title: Getting Started with Just
sidebar_label: Getting Started
---

`Just` simplifies your life in managing build tasks. It stands on the shoulders of excellent and well tested libraries: undertaker, yargs, and plop.js. We encourage developers to make `just-scripts` available locally instead of installing `just-scripts` as a global tool.

```sh
npm i -D just-scripts
```

Place some task definitions inside `just.config.js` in your root folder (next to package.json):

```js
const { task, option, logger, argv } = require('just-scripts');

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

Learn how to [compose tasks in just](composition.md)
