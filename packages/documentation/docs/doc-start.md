---
id: doc-start
title: Getting Started with Build
sidebar_label: Getting Started
---

# Getting Started

Build Rig is a build task definition library. It stands on the shoulders of two excellent and well tested libraries: undertaker and yargs. To get started, place a `rig.js` file in the root of your project:

```
touch rig.js
```

Place some task definitions inside this file:

```js
const { task } = require('build-rig');

task('hello', function() {
  this.logger.info('world');
});
```

Then run it!

```
> npx rig hello
```

That's all!

## Next Steps

Learn about how to compose tasks into _rigs_
