---
id: logging
title: Logging
sidebar_label: Logging
---

`build-rig` is simple, but it is opinionated. One of the built-in capabilities of `build-rig` is logging. We feel that this is an important enough of a feature to be available inside a task within its own context.

Typically, logging tasks look like the following:

![](assets/typical.png)

## Usage

To log within the task, simply use the `logger` object off of `this` inside a task function.

```js
task('needsLogging', function() {
  this.logger.info('log something');
});
```

If you want to log an error or warning do it with the `logger` object's `warn()` and `error()` functions. It looks like this following:

![](assets/failure.png)

```js
task('needsLogging', function() {
  this.logger.warn('a warning');
  this.logger.error('an error');
});
```

If your error is meant to stop the tasks, simply throw an Error:

```js
task('needsLogging', function() {
  throw new Error('an error');
});
```

## Next Steps

Learn about processing [arguments from command line](args.md)
