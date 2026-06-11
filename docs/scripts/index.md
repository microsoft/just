# Just scripts

Just is useful from the start. You can either write your own tasks that call Node.js tools like TypeScript, jest, and webpack, or use the script functions `just-scripts` provides to get productive immediately — without being locked into a particular stack.

> NOTE: `just-scripts` declares `typescript` and other large dependencies as **optional peer dependencies**. This means you can install only the dependencies you intend to use, with the desired versions for your project (rather than pulling in a different version by accident). `just-scripts` is also very flexible about how it resolves dependencies: it will try relative to `cwd`, the config file location, any custom resolve paths, or the `just-scripts` package.

The `just-scripts` task helpers are coded as higher order task functions. Each of these script functions return a task function to be registered as a task in your own `just.config.ts` like this:

```ts
// just.config.ts
import { tscTask } from 'just-scripts';
task('ts', tscTask());
```

Generally, these higher order functions also take an `options` argument to generate a specific task function preconfigured according to the options. For example:

```ts
// just.config.ts
import { tscTask } from 'just-scripts';
task('ts:commonjs', tscTask({ module: 'commonjs' }));
task('ts:esnext', tscTask({ module: 'esnext' }));
```

Something like this will give you two separate TypeScript compilation task functions that produce different kinds of module output format.
