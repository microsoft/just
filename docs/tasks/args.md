# Command line arguments

`just-task` uses the best pirate themed command line argument library ever: `yargs`, matey! So, rigs get documented pretty much automatically. However, tasks can customize the arguments that are accepted. `just-task` exposes these via `this.argv` inside a task function.

## Reading arguments

To read the arguments passed in from command line, use the `argv()` function provided by `yargs`.

```js
const { task, argv } = require('just-task');

task('pillageMeArgs', function () {
  logger.info('a bunch of aarrrrrrgs', argv());
});
```

## Describe the task with `option()`

```js
const { task, logger, option, argv } = require('just-task');

option('name');

task('blimey', 'An exclamation of surprise.', function () {
  logger.info(`blimey! ${argv().name}`);
});
```

The `option()` function is the same one exposed by `yargs.option()` - so you can look up that [`option()` documentation](http://yargs.js.org/docs/#api-optionkey-opt) for what is possible.

## Automatically generated task help usage

If you describe the task in this fashion, you can get a list of tasks with descriptions like this:

```
just --help
just blimey --help
```
