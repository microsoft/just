---
id: stacks
title: Just Stacks
sidebar_label: Just Stacks
---

Just also provides what we call "stacks" to complete the workflow of building a repository. Just Stacks provides:

1. a project generator for single package or monorepo repository via `create-just`
2. generated repo depends on a `stack` like `just-stack-react` and `just-stack-monorepo` which provides all the devDependencies needed to build those stacks
3. these `stack`s also take `just-scripts` as a dependency which gives the repos the necessary build scripting for different parts of the stack (compiler, test runner, and bundler)

## Generate a new project

It is very fast and easy to get started! We have taken care to make this experience as fast as possible. You can create a project in a couple of seconds:

```
npm init just
```

From here, you can choose a type of project to scaffold. We'll take a look the different kinds in the next sections.
