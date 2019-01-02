---
id: doc-start
title: Getting Started with Just ____
sidebar_label: Getting Started
---

`Just` is a build task definition library. It stands on the shoulders of two excellent and well tested libraries: undertaker and yargs.

```sh
npm i -g just-task
```

Place some task definitions inside `just-task.js` in your root folder (next to package.json):

```js
const { task, option, logger, argv } = require('just-task');

option('name', { default: 'world' });

task('sayhello', function() {
  logger.info(argv().name);
});
```

Then run it!

```sh
$ just sayhello
$ just sayhello --name me
```

That's all!

## Next Steps

Learn about how to [compose tasks in just-task.js](composition.md)
