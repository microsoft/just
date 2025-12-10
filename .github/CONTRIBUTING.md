# Contributing

This page contains the contributing guidelines.

## Setup

### Prerequisites

Install [Node.js](https://nodejs.org/en/). The version specified in [`.nvmrc`](../.nvmrc) is guaranteed to work, but newer versions will likely work too.

Install Yarn: `npm i -g yarn`

Note that the doc site (under the `docs` folder) has a newer version of Node, with a separate installation and build commands.

### Project setup

Fork the **just** repo from [https://github.com/microsoft/just](https://github.com/microsoft/just), then clone your fork.

```bash
git clone <your-clone-url>
cd just
```

## Local development

### Install and build

```bash
$ yarn
$ yarn build
```

### Run and test

To run this with Node:

```bash
$ yarn start
```

To run tests and/or lint:

```bash
$ yarn test
$ yarn lint
```

## Before making a PR

After committing your changes, you'll need to create a Beachball change file. From the repo root, run:

```bash
$ yarn change
```
