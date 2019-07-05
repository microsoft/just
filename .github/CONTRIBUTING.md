# Contributing

This page contains the contributing guidelines.

## Setup

### prerequisite

- Node.js installed.
  _Note: Node v8.0.0 (LTS) or greater would be better for "best results"._
- Package manager - [yarn](https://yarnpkg.com/en/docs/getting-started)

### Project Setup in your local machine

- Fork the **just** repo at [https://github.com/microsoft/just](https://github.com/microsoft/just).
- `git clone <your-clone-url> && cd just`

### Dependency Installation

- Using yarn

```bash
$ yarn
$ yarn build
```

### Running and Testing locally

**To run this with node**

```bash
$ yarn start
```

**To test the project**

```bash
$ yarn test
```

## Naming a branch

Making a branch in your fork for your contribution is helpful in the following ways:

- It allows you to submit more than one contribution in a single PR.
- It allows us to identify what your contribution is about from the branch name.

You will want to checkout the `master` branch locally before creating your new branch.

There are two types of branches:

- Feature
- Bugfix
- Docs

**Format**

`Feature/<feature-name>`

`Bugfix/<fix-type>`

## before commit commands

This commands are important in-order to pass the CI tests

- **Check the lint**

`$ yarn lint`

- **Tests**

`$ yarn test`

- **Changes checking and writing**

Check using `$ yarn checkchange`

and if changes needs to be log _(will be mentioned from the above command)_, write the changes using
