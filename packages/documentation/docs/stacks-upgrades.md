---
id: stacks-upgrades
title: Upgrading Repos
sidebar_label: Upgrading Repos
---

`just-stack` upgrades are done via updating two dependencies:

1. `just-scripts`
2. `just-stack-*`

The `just-scripts` dependency updates the build scripts. When new functionality has been added or updated, you can update this dependency. For example, eslint task has been added recently and can be used when the scripts package is updated.

Separately, the `just-stack-*` dependency contain all the devDependencies needed for the `just-scripts`. These are versioned independently because scripts and deps can be released at different times. For example, even if we added new scripts inside `just-scripts`, generated repos may still want to keep the current devDependencies so not to have interruptions.
