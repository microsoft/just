# Getting started

`Just` simplifies your life in managing build tasks. It stands on the shoulders of excellent and well tested libraries: undertaker, yargs, and plop.js. We encourage developers to make `just-scripts` available locally instead of installing `just-scripts` as a global tool.

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

Node.js 22.18+ supports running TypeScript natively via [type stripping](https://nodejs.org/docs/latest-v22.x/api/typescript.html#type-stripping). Just takes advantage of this, so you only need `typescript` installed:

```
npm i -D typescript
```

Place tasks inside `just.config.ts` in your root folder (next to package.json):

```js
// ES Module style
import { task, option, logger, argv } from 'just-scripts';

option('name', { default: 'world' });

task('sayhello', function () {
  logger.info(argv().name);
});
```

## Run it!

Then run it! It is best to either place `just` inside a npm run script or run it with `npx`:

```sh
$ npx just sayhello
$ npx just sayhello --name me
```

That's all!
