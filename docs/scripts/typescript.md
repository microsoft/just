---
id: scripts-ts
title: TypeScript
sidebar_label: TypeScript
---

TypeScript is a very popular compiler that allows developers to use modern ES6 features as well as a very mature typing system. The benefits are so great that it has become one of the first presets supported by the `just-scripts` library.

Given a library with TypeScript source code, it might be desirable to have multiple output formats for different audiences. By default, the `tscTask()` function looks for the `tsconfig.json` present in the project root. The preset higher order function can take in an option that overrides compilation options. The TypeScript compiler options are passed to the `tsc.js` script.

A list of available options are located at the [TypeScript documentation site](http://www.typescriptlang.org/docs/handbook/compiler-options.html). The options passed into the preset function will be passed in as command line arguments as a string.

```tsx
// just.config.js
import { tscTask } from 'just-scripts';
task('ts', tscTask());
```

For variety, try having two kinds of output at the same time (built in parallel)

```tsx
// just.config.js
import { parallel } from 'just-task';
import { tscTask } from 'just-scripts';
task('ts:commonjs', tscTask({ module: 'commonjs' }));
task('ts:esnext', tscTask({ module: 'esnext' }));
task('ts', parallel('ts:commonjs', 'ts:esnext'));
```
