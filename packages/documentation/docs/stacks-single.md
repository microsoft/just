---
id: stacks-single
title: Single Stack
sidebar_label: Single Stack
---

The simplest kind of projects are the single package repositories. Out of the box, `just` can create a single package library or a batteries-included web application. The generated repository will use the `just-task` library to manage its build definitions. You can customize the build task flow by editing the `just-task.js` at the root of the generated repository.

To get started, have a look at the `README.md` at the root of the newly generated repository. Some of the common commands are listed here.

# Installing dependencies

Installing dependencies is the job of the package manager. By default node.js comes with the `npm` package manager. We can simply do this:

```
npm install
```

> Don't forget to run `npm install` after you do a `git pull`

# Building package

To build the package, simply run the `build` npm script:

```
npm run build
```

To develop with an innerloop experience, type:

```
npm start
```

# Testing the package

The `jest` library is used to run tests. This library can run unit tests in parallel and has a good developer experience when developing test by providing an innerloop capability via its watch mode.

To run the tests in one pass:

```
npm test
```

To do innerloop test development:

```
npm run start-test
```
