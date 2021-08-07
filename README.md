# Just

[![npm version](https://badge.fury.io/js/just-task.svg)](https://badge.fury.io/js/just-task)
[![NPM Downloads](https://img.shields.io/npm/dm/just-task.svg?style=flat)](https://www.npmjs.com/package/just-task)

`Just` is a library that organizes build tasks for your JS projects. It consists of

- a build task build definition library
- sane preset build flows for node and browser projects featuring TypeScript, Webpack and jest
- project scaffold tool that generates no-ejection needed repos that tracks template changes

# Documentation

All the documentation is online at https://microsoft.github.io/just/

# Building

This README contains only the instructions on how to build and contribute to the project. This is a monorepo that uses the [lerna](https://github.com/lerna/lerna) monorepo management utility. To get started, simply run the following:

`yarn`

and build all the packages this way:

`yarn build`

Development is usually done one package at a time. So go into each package and develop with the innerloop npm script:

```
cd packages/just-task
yarn start
```

Tests are run with the `test` npm script:

```
cd packages/just-task
yarn test
```

# Making Changes

When you make a meaningful change in this repo, make sure to create a "change file" by running:

```
yarn change
```

What this does is to ask you for a description of your change and a change type. You could specify a minor or patch change.

Minor changes are for backwards compatible new features while patches are for bug fixes with no API changes.

# Packages

| Package            | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| create-just        | Invoked by `npm init just`, a tool that scaffolds project repos                         |
| just-task          | The task definition library that wraps `undertaker` and `yargs` libraries               |
| just-scripts       | A reusable preset of frequently used tasks in node and browser projects                 |
| just-stack-\*      | A set of templates to be used by the scaffold tool `create-just`                        |
| just-scripts-utils | A set of utilities that are shared between `just-scripts` and `create-just`             |
| just-task-logger   | A shared pretty logger used to display timestamps along with a message                  |
| documentation      | The Docusaurus site content and styles which generates the Github page for this library |

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com. Please refer [Contribution guide](https://github.com/microsoft/just/.github/CONTRIBUTING.md) for more details

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
