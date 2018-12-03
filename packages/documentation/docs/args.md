---
id: args
title: Command line arguments
sidebar_label: Command line arguments
---

`build-rig` uses the best pirate themed command line argument library ever: `yargs`, matey! So, rigs get documented pretty much automatically. However, tasks can customize the arguments that are accepted. `build-rig` exposes these via `this.argv` inside a task function.

## Reading arguments

To access the arguments passed in from command line, use the `this.argv` object provided by `yargs`.

```js
task('pillageMeArgs', function() {
  this.logger.info('a bunch of aarrrrrrgs', this.argv);
});
```

## Describe the task with Yargs command module

```js
task('blimey', { describe: 'An exclamation of surprise.', builder: yargs => yargs.option('name') }, function() {
  this.logger.info(`blimey! ${this.argv.name}`);
});
```

If you describe the task in this fashion, you can get a list of tasks with descriptions like this:

```
rig --help
rig blimey --help
```
