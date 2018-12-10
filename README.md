# Just

`Just` is a build task definition library. It stands on the shoulders of two excellent and well tested libraries: [undertaker](https://github.com/gulpjs/undertaker) and [yargs](https://github.com/yargs/yargs).

## Why not just `gulp`?

`undertaker` underpins the orchestration layer of `gulp`. So why not just use `gulp`? Everyone who uses gulp can related to these pain points:

1. It has a LOT of dependencies
2. gulp-\* plugins adds an extra level of abstraction that isn't needed most of the time
3. vinylfs abstraction and streaming content from plugin to plugin is not an intuitive way to code tools
4. gulp has a strange versioning policy where @latest is still at 3.x while 4.0 is stable and released a while ago - this confuses consumers of the library

## Core concepts

The core concept of this library is that related tasks are grouped together and exported via npm packages. Each project will have a `just-task.js` that imports tasks from those packages and also defines custom tasks for the project itself.

For example, the `just-task-typescript` package is installable from [npmjs.org](https://npmjs.org/just-task-typescript) and exports `typescript` and `typescript:watch` tasks. A rig file can then import and use them it like this:

```js
require('just-task-typescript');

const { task, series } = require('just-task');

task('clean', function() {
  // do the cleaning task stuff here
});

task('build', series('clean', 'typescript'));
```

## Usage

With the `just-task.js` in the root of the project, you can run the task by running:

```
just <task> [arguments]
```

For example:

```
just build --production
```

## What types of tasks are available?

### Synchronous tasks

While `gulp@4` got rid of the capability of having synchronous tasks. `just-task` augments `undertaker` to allow this style of task.

```ts
task('sync-task', function() {
  this.logger.info('Look ma! A Sync Task!');
});
```

> As you can see, lambda's are NOT supported. This is because the functions are bound to a context for `this` so the tasks can gain access to `just-task`-provided things like logger. Another thing that can be accessed from the context is the `argv` which is parsed by yargs.

### Asynchronous tasks with promises

`just-task` supports asynchronous tasks with promises. Simply return a promise in a task function and `just-task` will do the right thing.

```ts
// Async / Await automatically returns a promise
task('async-task', async function() {
  const response = await fetch('https://google.com');
  const html = await response.text();

  // do something with `html`
});

// Or remember to return a promise to make async tasks work
task('async-task-promise', function() {
  return Promise.resolve('dummy');
});
```

### Asynchronous tasks with callback

There are times when a callback-based async task is desired. There are times when the task is waiting on the completion of an asynchronous procedure from Node.js. Since most long-running Node.js function expects a callback to notify completion, `just-task` supports this feature.

```ts
task('async-task-callback', function(cb) {
  const logger = this.logger;
  fs.readFile('./temp/file.txt', (err, data) => {
    logger.info('file contents: ' + data.toString());
    cb();
  });
});
```
