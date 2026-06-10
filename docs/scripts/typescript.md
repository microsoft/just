# TypeScript

The `tscTask()` function runs the TypeScript compiler. By default it uses the `tsconfig.json` in the project root, but you can pass options to override compiler settings; these are forwarded to `tsc` as command-line arguments. See the [TypeScript docs](http://www.typescriptlang.org/docs/handbook/compiler-options.html) for the available compiler options.

```ts
// just.config.ts
import { tscTask } from 'just-scripts';
// The extra () => ensures all deps are delay resolved/loaded
task('ts', () => tscTask());
```

For variety, try having two kinds of output at the same time (built in parallel)

```ts
// just.config.ts
import { parallel } from 'just-task';
import { tscTask } from 'just-scripts';
task('ts:commonjs', () => tscTask({ module: 'commonjs' }));
task('ts:esnext', () => tscTask({ module: 'esnext' }));
task('ts', parallel('ts:commonjs', 'ts:esnext'));
```
