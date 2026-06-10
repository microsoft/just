# Higher order task functions

Preset task factories like `tscTask` from `just-scripts` generate a task function when called. To produce variations of a preconfigured task on the fly, wrap the factory call in a `thunk` — a task function that returns a task function.

(For convenience, `just-scripts` also exports the contents of `just-task`, and provides its own CLI called `just-scripts`, which wraps the `just` CLI from `just-task`.)

Here is an example of a simple usage of a preset task function factory:

```ts
import { task, tscTask } from 'just-scripts';

task('build', tscTask());
```

Now, let's try to preconfigure this task based on something we can pass in from the arguments:

```ts
import { task, argv, option, tscTask } from 'just-scripts';

option('amd');

task('build', () => tscTask({ module: argv().amd ? 'amd' : 'commonjs' }));
```

Now the build task can take in an argument and perform TypeScript compilation for different modes:

```sh
$ just-scripts build         # compiles with module: commonjs
$ just-scripts build --amd   # compiles with module: amd
```
