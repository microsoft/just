# Change Log - just-scripts

This log was last generated on Sat, 01 Jun 2019 04:59:34 GMT and should not be manually modified.

## 0.20.0
Sat, 01 Jun 2019 04:59:34 GMT

### Minor changes

- Upgrades api-extractor task API usage

## 0.19.0
Fri, 31 May 2019 22:15:26 GMT

### Minor changes

- updated apiextractor task

## 0.18.0
Fri, 31 May 2019 21:15:02 GMT

### Minor changes

- adds css / style loader to webpack

## 0.17.0
Fri, 24 May 2019 17:59:43 GMT

### Minor changes

- Add a `fix` option to tslintTask

## 0.16.0
Tue, 21 May 2019 22:37:14 GMT

### Minor changes

- Switch clean, copy, and sass tasks to use options objects
- Adds a nodeArgs to jestTask
- add flag to write output stats

## 0.15.3
Wed, 15 May 2019 18:44:04 GMT

### Patches

- Update task presets to clean all the output dirs they create
- Switch microsoft in repo URL to lowercase

## 0.15.2
Tue, 14 May 2019 23:58:34 GMT

### Patches

- export copy instructions types as well

## 0.15.1
Tue, 14 May 2019 17:59:20 GMT

### Patches

- Adds just-scripts bin script

## 0.15.0
Fri, 10 May 2019 00:04:16 GMT

### Minor changes

- adds a new advanced copy task
- added prettier task

### Patches

- Gets rid of the loc stuff
- fix tscTask requiring an empty object for option

## 0.14.4
Wed, 24 Apr 2019 23:38:23 GMT

### Patches

- Added webpack overlays and such

## 0.14.3
Tue, 23 Apr 2019 16:19:37 GMT

### Patches

- get rid of accidental console.log
- get rid of another accidental console.log in webpackTask

## 0.14.1
Fri, 19 Apr 2019 01:51:22 GMT

### Patches

- update add package task to remove extra just-stack devdep when provisioning a new repo

## 0.14.0
Wed, 17 Apr 2019 23:43:45 GMT

### Minor changes

- Added upgrade-stack with diff-match-patch algo

## 0.13.0
Tue, 16 Apr 2019 19:33:20 GMT

### Minor changes

- Gives the add-package script a way to take in params for generating name and stack

## 0.12.3
Mon, 15 Apr 2019 21:26:42 GMT

### Patches

- Fix the require statement of for webpack config since it no longer uses webpack to bundle the just-scripts

## 0.12.2
Thu, 11 Apr 2019 18:27:56 GMT

### Patches

- make the just-stack.json write out to a specific installed version of stack

## 0.12.1
Wed, 10 Apr 2019 21:52:06 GMT

### Patches

- fix add-package task to list actual stacks

## 0.12.0
Wed, 10 Apr 2019 20:30:38 GMT

### Minor changes

- Fixing up the upgrade scripts to use devdeps instead of just.stacks; also uses a diff / apply method to get upgrades working

## 0.11.2
Fri, 05 Apr 2019 22:59:13 GMT

### Patches

- fix the rootpath for finding installed stacks again

## 0.11.1
Fri, 05 Apr 2019 21:18:13 GMT

### Patches

- Find installed stack from scripts folder in monorepo

## 0.11.0
Fri, 29 Mar 2019 20:31:33 GMT

### Minor changes

- Stop webpacking package

## 0.10.1
Wed, 27 Feb 2019 06:19:32 GMT

### Patches

- Fix webpack task to handle config arrays

## 0.10.0
Fri, 22 Feb 2019 23:37:36 GMT

### Minor changes

- Consistent interface naming

## 0.9.0
Fri, 22 Feb 2019 22:50:01 GMT

### Minor changes

- Move exec to just-scripts-utils

## 0.8.1
Fri, 22 Feb 2019 19:03:38 GMT

### Patches

- Update package metadata

## 0.8.0
Fri, 22 Feb 2019 18:39:56 GMT

### Minor changes

- Fix return types of task factories

## 0.7.9
Thu, 21 Feb 2019 22:15:15 GMT

### Patches

- Enables sourcemap for debugging just-scripts in case of error

## 0.7.8
Thu, 21 Feb 2019 04:41:31 GMT

### Patches

- addPackageTask: Remove extra files from template before running rush update

## 0.7.7
Wed, 20 Feb 2019 23:17:15 GMT

### Patches

- Lock some dep versions

## 0.7.6
Wed, 20 Feb 2019 16:30:03 GMT

### Patches

- Remove generated vs code settings when adding package in monorepo

## 0.7.5
Wed, 13 Feb 2019 22:31:47 GMT

### Patches

- Dependency updates and improved error handling

## 0.7.4
Mon, 04 Feb 2019 05:47:04 GMT

### Patches

- upgrade repo to use templates deps in a monorepo scripts folder

## 0.7.3
Fri, 25 Jan 2019 07:08:59 GMT

### Patches

- Fixes webpack task

## 0.7.2
Wed, 23 Jan 2019 00:05:38 GMT

### Patches

- better logging during add package

## 0.7.1
Tue, 22 Jan 2019 22:49:45 GMT

### Patches

- exports the correct named exports for presets

## 0.7.0
Tue, 22 Jan 2019 22:31:23 GMT

### Minor changes

- move utils from scripts to here, get rid of preset dep

## 0.6.0
Tue, 22 Jan 2019 21:28:18 GMT

### Minor changes

- absorbed the just-task-preset stuff

## 0.5.0
Mon, 21 Jan 2019 19:57:09 GMT

### Minor changes

- added upgrade-repo task

## 0.4.1
Mon, 21 Jan 2019 02:54:15 GMT

### Patches

- fix upgrade stack task

## 0.4.0
Mon, 21 Jan 2019 02:21:01 GMT

### Minor changes

- uses script utils

