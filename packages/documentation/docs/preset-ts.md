---
id: preset-ts
title: Typescript
sidebar_label: Typescript
---

Typescript is a very popular compiler that allows developers to use modern ES6 features as well as a very mature typing system. The benefits are so great that it has become of the first presets supported by the `just-task-preset` library.

Given a library with Typescript source code, it might be desirable to have multiple output formats for different audiences. By default, the `tscTask()` function looks for the `tsconfig.json` present in the project root. The preset higher order function can take in an option that overrides compilation options. The Typescript compiler options are passed to the `tsc.js` script.

A list of available options are located at the [Typescript documentation site](http://www.typescriptlang.org/docs/handbook/compiler-options.html). The options passed into the preset function will be passed in as command line arguments as a string.

```tsx
// just-task.js
import { tscTask } from 'just-task-preset';
task('ts', tscTask());
```

For variety, try having two kinds of output at the same time (built in parallel)

```tsx
// just-task.js
import { parallel } from 'just-task';
import { tscTask } from 'just-task-preset';
task('ts:commonjs', tscTask({ module: 'commonjs' }));
task('ts:esnext', tscTask({ module: 'esnext' }));
task('ts', parallel('ts:commonjs', 'ts:esnext'));
```

## Next Steps

Learn about the [Jest preset](preset-jest.md)
