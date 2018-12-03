---
id: logging
title: Logging
sidebar_label: Logging
---

`build-rig` is simple, but it is opinionated. One of the built-in capabilities of `build-rig` is logging. We feel that this is an important enough of a feature to be available inside a task within its own context.

## Usage

To log within the task, simply use the `logger` object off of `this` inside a task function.

```js
task('needsLogging', function() {
  this.logger.info('log something');
});
```

## Next Steps

Learn about processing [arguments from command line](args.md)
