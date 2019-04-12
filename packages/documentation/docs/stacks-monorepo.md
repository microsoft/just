---
id: stacks-monorepo
title: Monorepo Stack
sidebar_label: Monorepo Stack
---

When there are many highly related packages that are usually developed together, it makes sense to put them in the same repository. This ensures that those changes are atomic and can be released together in one go. When we put multiple packages inside a single repository, we call this a monorepo.

Just uses the [Rush](https://rushjs.io) library to manage monorepos. This library handles linking lots of little packages together to ensure a sane developer experience. Rush is powerful, but it does not provide opinions about what kind of packages are scaffolded inside the monorepo. Just Stacks provides this for Rush monorepos.

After creating a monorepo, you can create packages, incrementally build all the packages, and even upgrade the packages according to changes from the templates by an [upgrade process](stacks-upgrades.md).

# Installing dependencies

Installing dependencies is the job of the Rush monorepo manager. By default node.js comes with the `npm` package manager. We can simply do this:

```
npm install
```

We have hooked up Rush's installation process with the `npm install` script for convenience.

> Like the single package stacks, don't forget to run `npm install` after you do a `git pull`

# Building monorepo

To build all the packages, simply run the `build` npm script. Previously built packages will not be built. We call this incremental builds:

```
npm run build
```

To develop with an innerloop experience, go inside the individual package and type:

```
cd packages/foo
npm start
```

# Adding a new package into the repo

Rush actually requires a few steps to add a new package to its monorepo. `just-scripts` for monorepo fills this gap by providing a scaffolding experience similar to that of a `npm init just` call like when the monorepo was generated. Simply run this at the root of the monorepo:

```
npm run add-package
```

After picking a package name and a package type, the new package will be placed under `packages/` directory. Make sure you run an update to make sure deps and symlink are established by Rush:

```
npm run update
```

# Adding, updating, or removing a dependency to a package inside the monorepo

To modify a dependency after a package already exists inside the monorepo, modify the package's `package.json` to include the dependency. Then run the update command to retrieve the dependencies:

```
npm run update
```
