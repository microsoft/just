---
id: stacks-upgrades
title: Upgrading Repos
sidebar_label: Upgrading Repos
---

`just-stack` is unique in that it tries to solve the template synchronization problem. When a repository has been scaffolded, generally the repository takes on a life of its own. There is no way for the template authors to help the generated repositories consume any updates. `just-stack` employs a strategy of tracking diffs between template upgrades to be applied to existing repositories.

For example, suppose there was a repository named `kittens` that was scaffolded from the `just-stack-single-lib`:

1. Alice scaffolds a `kittens` repo via the `npm init just` command, selecting the `just-stack-single-lib` project type
2. Bob, the template author, modifies the `just-stack-single-lib` dependency of `@types/node` to the latest to take advantage of the cool new typings
3. Alice sees a change in the stack template, and decides to upgrade. She updates the `just-stack-single-lib` devDependencies inside her `/package.json`
4. Alice runs an update `npm install`
5. Alice then runs `npm run upgrade-repo` command to apply any new changes into her existing repo

This flow is very similar to the scaffolded monorepos:

1. Alice scaffolds a `kittens` repo via the `npm init just` command, selecting the `just-stack-monorepo` project type
2. Bob, the template author, modifies the `just-stack-single-lib` dependency of `@types/node` to the latest to take advantage of the cool new typings
3. Alice sees a change in the stack template, and decides to upgrade. She updates the `just-stack-single-lib` devDependencies inside her `/scripts/package.json`
4. Alice runs an update `npm run update` at the root
5. Alice then runs `npm run upgrade-repo` command to apply any new changes into her existing repo

> Note: there are differences in the location of the `devDependencies` in step 3. Step 4 also requires Alice to run a slightly different command to update the dependencies `npm run update`
