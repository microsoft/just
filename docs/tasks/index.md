# Getting started

`Just` simplifies your life in managing build tasks. It stands on the shoulders of excellent and well tested libraries: `undertaker` and `yargs-parser`.

Start by installing `just-task` in your project:

```sh
npm i -D just-task
```

Use `just-scripts` instead if you need [preset build tasks](../scripts/index). It re-exports the `just-task` APIs, so either package is a valid import source for the examples below.

## Defining tasks

Place some task definitions inside `just.config.js` in your root folder (next to package.json):

```js
// CommonJS style
const { task, option, logger, argv } = require('just-task');

option('name', { default: 'world' });

task('sayhello', function () {
  logger.info(argv().name);
});
```

## Defining tasks in style with TypeScript

Node.js **22.18.0 or newer** can load TypeScript directly without `ts-node` using native [type stripping](https://nodejs.org/docs/latest-v22.x/api/typescript.html#type-stripping). Place tasks inside `just.config.ts` in your root folder (next to package.json). If your package sets `"type": "commonjs"`, use `just.config.mts` for ES module syntax instead.

```ts
// ES Module style
import { task, option, logger, argv } from 'just-task';

option('name', { default: 'world' });

task('sayhello', function () {
  logger.info(argv().name);
});
```

Just discovers `just.config.js`, `.cjs`, `.ts`, `.cts`, `.mjs`, and `.mts`, plus the legacy `just-task.js`. Use `.mjs` or `.mts` for explicit ES modules, or `.cjs` or `.cts` for explicit CommonJS. ES module configs can use top-level `await`.

Node strips types but does not type-check or read `tsconfig.json`. Use `import type` for type-only imports and explicit extensions for relative ES module imports, such as `import './tasks.ts'`. Syntax that requires transformation, such as enums and parameter properties, must be rewritten or compiled ahead of time. See [Node's type stripping documentation](https://nodejs.org/docs/latest-v22.x/api/typescript.html#type-stripping) for the full syntax restrictions.

## Run it!

Then run it! You can either call `just` inside package.json `scripts` or run it directly with `npx`/`yarn`:

```sh
$ npx just sayhello
$ npx just sayhello --name me

# With just-scripts installed:
$ npx just-scripts sayhello
```

(The `just` CLI comes from `just-task`. Installing `just-scripts` also makes it available through its `just-task` dependency, unless you use a package manager with strict installation layout. `just-scripts` directly provides an interchangeable wrapper CLI called `just-scripts`.)
