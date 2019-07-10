# JS Build Tooling

- In the JS ecosystem of ecosystems with each tool able to be configured differently
- Achievement unlocked: we have arrived at O(n^3) complexity!
  - This is both the strength and weakness of JS
- The pace of change is blindingly fast - following build tooling and frameworks trends is a bit like following fashion trends!

# State of the Art Web Tool Stack

- package manager (npm, yarn, pnpm)
- monorepo management software (lerna, rush)
- language transpiler (Typescript, Babel + Flow)
- linter (tslint, eslint)
- code editor (VS Code, vim, emacs, Sublime Text)
- platform-agnostic tooling language (JS on Node.js)
- bundler (webpack, rollup)
- documentation software (custom, gatsby, docusaurus)
- test runner (jest, mocha, karma)
- component browser (storybook, styleguidist)

note: there are so many more aspects of the tooling I cannot fit it on here

# A study of Webpack ecosystem

- webpack is an ecosystem with loaders and plugins (loaders can be chained, and each can have a set of configuration)
- webpack can be called as a node API or CLI
- the configuration file can be a JSON, a function that returns JSON, or a function that returns a Promise of JSON value
- for each web tool, there seems to be a set of plugin and / or loader that uses that tool
- output and input formats are completely flexible (AMD, commonjs, ES modules)
- every repo does this slightly differently, and are using different versions of webpack

# Does this sound familiar?

- App starts with a bunch of very simple npm scripts
- Quickly grows too complex, so we put in a task runner called grunt
- A week later, prominent members of the community denounced grunt and declared gulp to be amazing
- App dev goes and replaced grunt with gulp
- Community felt burnt by these tools, and rallied behind using npm run as a "standard" on top of any tools
- Same poor app dev replaces gulp with loose npm scripts

# Most devs don't want to maintain build tools, so they borrow from existing projects

- when starting out, Office Online, SDX, and several others teams have copied UI Fabric's build scripts
- eventually they made their own mods to those scripts to get things working for their orgs
- feature updates between teams cannot be shared
- UI Fabric factored a bunch of these scripts in a little library called "just"

# Just - a task library that works

- OSS, documented
- Where possible, re-use existing libraries at the right abstraction layer

# Just Features

- a task orchestrator: uses undertaker which is also what gulp uses
- an argument parser: uses yargs because pirates
- a set of _scripts_: preset tasks for common web tools as listed before
- a set of _stacks_: templates that contain the versioned dev & dependencies

# Task Orchestrator

- Tasks are simple functions that either:

  - returns nothing
  - returns a promise
  - returns a child process

- Tasks are composable via "series" or "parallel"

https://microsoft.github.io/just/docs/composition

# Scripts

- Preconfigured task functions for common tooling
- called inside a package.json npm script section
- Idea is borrowed from create-react-app's react-scripts
- just-scripts do NOT include the dependencies themselves - only instructions for running

# Scripts: TypeScript example

```ts
// just-task.js
import { parallel } from 'just-task';
import { tscTask } from 'just-scripts';
task('ts:commonjs', tscTask({ module: 'commonjs' }));
task('ts:esnext', tscTask({ module: 'esnext' }));
task('ts', parallel('ts:commonjs', 'ts:esnext'));
```

https://microsoft.github.io/just/docs/scripts-ts

# Scripts: Webpack example

- Check for presence of `webpack.config.js` - runs webpack if found
- Unlike create-react-app, do not need to "eject" to configure webpack
- Webpack config is complex, `just-scripts` introduces the concept of "overlays" to be applied one layer at a time to add functionality
  - fileOverlay: This adds the `file-loader` to allow loading SVG, PNG, GIF, JPG files
  - htmlOverlay: This adds the `html-webpack-plugin` that generates the right code to include scripts and other assets into your index.html
  - stylesOverlay: This adds styling support for both CSS and Sass
  - tsOverlay: This adds a `ts-loader` transpilation support for TypeScript and `fork-ts-checker-webpack-plugin` for typechecking

# Stacks

- Provides a template for starting a new project
- Dependencies are included inside the Stack, so updating the stack will bring in all the relevant dependency updates
- Will include scripts to help bring `just-stack-*` deps up-to-date (in coordination with bots like dependabot)

# Stack: example

```
npm init just
```

`create-just` can be part of another starter like `create-uifabric`

```
npm init uifabric
```

A generated package will container this devDependency inside package.json:

```json
{
  "devDependencies": {
    "just-stack-uifabric": ">=0.11.4"
  }
}
```

This will bring in all the devDepenencies from this stack. To upgrade stack dependencies, just upgrade this one dependency.
