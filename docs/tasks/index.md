# Getting started

`Just` simplifies your life in managing build tasks. It stands on the shoulders of excellent and well tested libraries: `undertaker` and `yargs-parser`.

Start by installing `just-scripts` in your project:

```sh
npm i -D just-scripts
```

## Defining tasks

Place some task definitions inside `just.config.js` in your root folder (next to package.json):

```js
// CommonJS style
const { task, option, logger, argv } = require('just-scripts');

option('name', { default: 'world' });

task('sayhello', function () {
  logger.info(argv().name);
});
```

## Defining tasks in style with TypeScript

1. Install `ts-node` and `typescript`:

```
npm i -D ts-node typescript
```

2. Place tasks inside `just.config.ts` in your root folder (next to package.json):

```ts
// ES Module style
import { task, option, logger, argv } from 'just-scripts';

option('name', { default: 'world' });

task('sayhello', function () {
  logger.info(argv().name);
});
```

## Run it!

Then run it! You can either call `just` inside package.json `scripts` or run it directly with `npx`/`yarn`:

```sh
$ npx just sayhello
$ npx just sayhello --name me

# Alternatively:
$ npx just-scripts sayhello
```

(The `just` and `just-scripts` CLIs are interchangeable: `just` CLI comes from the `just-scripts` package's dependency `just-task`, so it should be available automatically unless you use a package manager with strict installation layout. `just-scripts` directly provides a wrapper CLI called `just-scripts`.)
