---
id: stacks-monorepo
title: Monorepo Stack
sidebar_label: Monorepo Stack
---

When there are many highly related packages that are usually developed together, it makes sense to put them in the same repository. This ensures that those changes are atomic and can be released together in one go. When we put multiple packages inside a single repository, we call this a monorepo.

Just uses the [Lerna](https://lerna.js.org) library to manage monorepos together with [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/). Those libraries handles linking monorepo packages together to ensure a sane developer experience. Lerna is powerful, but it does not provide opinions about what kind of packages are scaffolded inside the monorepo. Just Stacks provides this for the monorepo.

# Prerequisites

Yarn is a prerequisite in using the monorepo stack. Install it like so:

```
npm install -g yarn
```

# Getting Started with the MonoRepo

After creating a monorepo, you can create packages, incrementally build all the packages, and even upgrade the packages according to changes from the templates by an [upgrade process](stacks-upgrades.md).

# Installing dependencies

Installing dependencies is the job of Yarn. Install all dependencies and bootstrap the monorepo like so:

```
yarn
```

> Like the single package stacks, don't forget to run `yarn` after you do a `git pull`

# Building monorepo

To build all the packages, simply run the `build` npm script. Previously built packages will not be built. We call this incremental builds:

```
yarn build
```

To develop with an innerloop experience, go inside the individual package and type:

```
cd packages/foo
yarn start
```

# Adding a new package into the repo

Out of the box, the monorepo stack provides a mechanism to create new packages using the [plop.js](https://plopjs.com) utility. Simply run this to generate a new package:

```
yarn gen
```

After picking a package name and a package type, the new package will be placed under `packages/` directory. Make sure you update deps and symlink are established by Yarn:

```
yarn
```
