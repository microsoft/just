# Command line arguments

`just-task` uses the best pirate themed command line argument library ever: `yargs-parser`, matey!

## Reading arguments

To read the arguments passed in from command line, use the `argv()` function exported by `just-task`.

```ts
import { task, logger, argv } from 'just-task';

task('pillageMeArgs', function () {
  logger.info('a bunch of aarrrrrrgs', argv());
});
```

## Describe an option with `option()`

```ts
import { task, logger, option, argv } from 'just-task';

option('name');

task('blimey', 'An exclamation of surprise.', function () {
  logger.info(`blimey! ${argv().name}`);
});
```

The `option()` function configures how a key is parsed (for example as a `boolean`, `string`, `number`, or `array`, or with an `alias` or `default`). These options map to the [`yargs-parser` configuration](https://github.com/yargs/yargs-parser#api).

## Listing available tasks

You can get a list of registered tasks along with their descriptions by running `just` with no task name (or with `--help`):

```
just --help
```

Tasks defined with a description (the second argument to `task()`) will show that description in the list.
