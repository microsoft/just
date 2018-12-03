---
id: doc-start
title: Getting Started with Build
sidebar_label: Getting Started
---

Build Rig is a build task definition library. It stands on the shoulders of two excellent and well tested libraries: undertaker and yargs.

```sh
npm i -g build-rig
```

Place some task definitions inside `rig.js` in your root folder (next to package.json):

```js
const { task } = require('build-rig');

task('hello', function() {
  this.logger.info('world');
});
```

Then run it!

```sh
$ rig hello
```

That's all!

## Next Steps

Learn about how to [compose tasks into _rigs_](composition.md)
