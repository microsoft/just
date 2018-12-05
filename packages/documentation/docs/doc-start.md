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
const { task } = require('just-task');

task('sayhello', function() {
  this.logger.info('world');
});
```

Then run it!

```sh
$ just sayhello
```

That's all!

## Next Steps

Learn about how to [compose tasks into _rigs_](composition.md)
