# Change Log - just-task

This log was last generated on Sat, 02 Mar 2024 02:16:34 GMT and should not be manually modified.

<!-- Start content -->

## 1.9.0

Sat, 02 Mar 2024 02:16:34 GMT

### Minor changes

- Add an option --esm to support imports of ESM packages (elcraig@microsoft.com)

## 1.8.0

Tue, 12 Sep 2023 08:02:05 GMT

### Minor changes

- Add `@types` referenced by exports as dependencies (elcraig@microsoft.com)

### Patches

- Update dependency @rushstack/package-deps-hash to v4 (email not defined)
- Update dependency fs-extra to v11 (renovate@whitesourcesoftware.com)

## 1.7.2

Fri, 10 Mar 2023 08:01:53 GMT

### Patches

- Update readmes and homepage links (elcraig@microsoft.com)

## 1.7.1

Thu, 09 Mar 2023 08:02:09 GMT

### Patches

- Remove an incorrect reference to `yargs` types (elcraig@microsoft.com)
- Bump just-task-logger to v1.2.1

## 1.7.0

Fri, 18 Nov 2022 22:40:12 GMT

### Minor changes

- Require Node 14 (elcraig@microsoft.com)
- Bump just-task-logger to v1.2.0

## 1.6.1

Fri, 16 Sep 2022 08:02:22 GMT

### Patches

- Update dependency bach to v2 (email not defined)

## 1.6.0

Sat, 10 Sep 2022 08:02:45 GMT

### Minor changes

- Fix type of OptionConfig.default (elcraig@microsoft.com)

### Patches

- Update dependency fs-extra to v10 (email not defined)
- Update dependency undertaker-registry to v2 (email not defined)

## 1.5.1

Sat, 10 Sep 2022 00:19:03 GMT

### Patches

- Specify Node 12+ engines requirement (elcraig@microsoft.com)
- Bump just-task-logger to v1.1.2

## 1.5.0

Thu, 31 Mar 2022 17:04:30 GMT

### Minor changes

- Upgrading package-deps-hash to latest major to remove transitive security vulnerability in validator package. (dzearing@microsoft.com)

## 1.4.2

Fri, 10 Sep 2021 23:58:46 GMT

### Patches

- changes the dep from glob-parent which is old with chokidar directly (kchau@microsoft.com)

## 1.4.1

Thu, 15 Apr 2021 19:00:12 GMT

### Patches

- adding a check to make sure the tasks are registered only for task functions (kchau@microsoft.com)

## 1.4.0

Fri, 02 Apr 2021 23:21:50 GMT

### Minor changes

- just now accepts ES6 module as config (kchau@microsoft.com)

## 1.3.0

Sat, 20 Mar 2021 00:45:10 GMT

### Minor changes

- adds a watch() API that will generate taskfunction that watches (kchau@microsoft.com)

## 1.2.0

Tue, 26 Jan 2021 23:51:57 GMT

### Minor changes

- Add support for default config override (dannyvv@microsoft.com)

## 1.1.1

Thu, 14 Jan 2021 20:55:06 GMT

### Patches

- fixing release pipeline and the empty lib folder (kchau@microsoft.com)

## 1.1.0

Wed, 13 Jan 2021 23:22:52 GMT

### Minor changes

- Update typescript and other dependencies (elcraig@microsoft.com)

### Patches

- exit code 1 for unknown just command (kchau@microsoft.com)
- Bump just-task-logger to v1.1.0 (elcraig@microsoft.com)

## 1.0.2

Mon, 02 Nov 2020 16:42:46 GMT

### Patches

- Bump yargs dependency (1581488+christiango@users.noreply.github.com)

## 1.0.1

Mon, 02 Nov 2020 16:26:27 GMT

### Patches

- Publish src folder (1581488+christiango@users.noreply.github.com)

## 1.0.0

Tue, 06 Oct 2020 23:06:25 GMT

### Major changes

- removed just-stack-* (kchau@microsoft.com)

### Patches

- Remove implicit SDI usage (darthtrevino@gmail.com)
- fixes publish (kchau@microsoft.com)

## 0.17.0

Tue, 02 Jun 2020 20:33:23 GMT

### Minor changes

- resolve: add extensions option (elcraig@microsoft.com)

## 0.16.0
Fri, 24 Apr 2020 17:48:46 GMT

### Minor changes

- Resolve from custom resolve paths before Just location (email not defined)
## 0.15.1
Fri, 24 Apr 2020 16:46:48 GMT

### Patches

- change target in enableTypeScript (imjuni@gmail.com)
## 0.15.0
Fri, 10 Apr 2020 20:34:02 GMT

### Minor changes

- Replace yargs with yargs-parser, taking over the command parsing (kchau@microsoft.com)
## 0.14.3
Mon, 11 Nov 2019 21:09:42 GMT

### Patches

- Show full stack on config file errors (elcraig@microsoft.com)
## 0.14.2
Fri, 18 Oct 2019 21:58:37 GMT

### Patches

- esModuleInterop is important to have as true (kchau@microsoft.com)
## 0.14.1
Fri, 18 Oct 2019 21:33:45 GMT

### Patches

- use full resolve logic for ts-node (kchau@microsoft.com)
## 0.14.0
Fri, 18 Oct 2019 19:52:03 GMT

### Minor changes

- adds support for typescript just.config.ts (kchau@microsoft.com)
## 0.13.3
Mon, 16 Sep 2019 19:57:52 GMT

### Patches

- Remove void from task() return type (elcraig@microsoft.com)
## 0.13.2
Mon, 26 Aug 2019 22:53:18 GMT

### Patches

- caching algo changed so it is faster (kchau@microsoft.com)
## 0.13.1
Mon, 22 Jul 2019 20:51:44 GMT

### Patches

- fail the build if it has invalid config (kchau@microsoft.com)

## 0.13.0
Thu, 11 Jul 2019 19:35:28 GMT

### Minor changes

- returns a wrapped task even when doing a task('foo', 'bar') form (kchau@microsoft.com)

## 0.12.2
Thu, 11 Jul 2019 17:08:46 GMT

### Patches

- speeding up build cache (kchau@microsoft.com)

## 0.12.1
Fri, 05 Jul 2019 16:59:55 GMT

### Patches

- Uppercase the S in TypeScript (orta.therox@gmail.com)

## 0.12.0
Thu, 04 Jul 2019 02:04:13 GMT

### Minor changes

- added a no-op detection for packages that aren't build and have no scripts (kchau@microsoft.com)

## 0.11.3
Tue, 02 Jul 2019 20:19:42 GMT

### Patches

- making build cache more accurately determine deps that aren't using just (kchau@microsoft.com)

## 0.11.2
Mon, 01 Jul 2019 20:15:20 GMT

### Patches

- introduce ESLint to sources (43081j@users.noreply.github.com)

## 0.11.1
Mon, 01 Jul 2019 18:55:04 GMT

### Patches

- fixes build cache so packages can have different path name than package name (kchau@microsoft.com)

## 0.11.0
Thu, 13 Jun 2019 21:16:34 GMT

### Minor

- adds a bit more rigor to support build deps invalidation of cache (kchau@microsoft.com)

## 0.10.0
Tue, 04 Jun 2019 15:55:03 GMT

### Minor changes

- Adds cache capability

## 0.9.9
Wed, 15 May 2019 18:44:04 GMT

### Patches

- Switch microsoft in repo URL to lowercase

## 0.9.8
Tue, 14 May 2019 17:59:20 GMT

### Patches

- Adds __dirname resolve as last resort

## 0.9.7
Fri, 10 May 2019 17:53:27 GMT

### Patches

- Adds validation of command and a friendlier error message

## 0.9.6
Fri, 03 May 2019 19:49:20 GMT

### Patches

- Show error message if it's a string

## 0.9.5
Wed, 01 May 2019 16:12:57 GMT

### Patches

- Export the chain API from the root as well

## 0.9.4
Mon, 29 Apr 2019 21:46:55 GMT

### Patches

- More explicit error logs

## 0.9.3
Thu, 25 Apr 2019 22:19:05 GMT

### Patches

- really get rid of deprecation warning

## 0.9.2
Thu, 25 Apr 2019 21:21:58 GMT

### Patches

- get rid of logs with the wrapped task

## 0.9.1
Thu, 25 Apr 2019 18:29:49 GMT

### Patches

- gets rid of dep0097 warnings when running just tasks

## 0.9.0
Wed, 17 Apr 2019 00:09:58 GMT

### Minor changes

- Adds API to allow injecting a task after task has been registered

## 0.8.1
Sun, 24 Feb 2019 04:07:27 GMT

### Patches

- Fix breaks caused by just-task resolve using the same yargs instance to check config path

## 0.8.0
Fri, 22 Feb 2019 23:37:36 GMT

### Minor changes

- Consistent interface naming

## 0.7.10
Fri, 22 Feb 2019 19:03:38 GMT

### Patches

- Update package metadata

## 0.7.9
Fri, 22 Feb 2019 16:58:03 GMT

### Patches

- Tests and docs for resolve

## 0.7.8
Thu, 21 Feb 2019 23:25:53 GMT

### Patches

- Use new logger package

## 0.7.7
Wed, 20 Feb 2019 23:17:15 GMT

### Patches

- Lock some dep versions

## 0.7.6
Tue, 22 Jan 2019 21:28:18 GMT

### Patches

- deps update

## 0.7.5
Sat, 05 Jan 2019 20:47:28 GMT

### Patches

- Fixed: make sure to display list of tasks that didn't complete

## 0.7.4
Sat, 05 Jan 2019 19:16:15 GMT

### Patches

- Fixed: set proper exit code for cases where task function exits the process before top level task is reached

## 0.7.3
Sat, 15 Dec 2018 04:42:57 GMT

### Patches

- fix bugs with config file search

## 0.7.2
Thu, 13 Dec 2018 23:56:45 GMT

### Patches

- Fixed: config file argument now works again

## 0.7.1
Thu, 13 Dec 2018 18:16:47 GMT

### Patches

- Fixed a bug with the new thunk replacement of just returning a function

## 0.7.0
Wed, 12 Dec 2018 18:57:17 GMT

### Minor changes

- Get rid of thunk API

## 0.6.1
Wed, 12 Dec 2018 03:04:50 GMT

### Patches

- Fixed resolution logic

## 0.6.0
Sun, 09 Dec 2018 23:01:57 GMT

### Minor changes

- Adds thunk and condition meta functions

## 0.5.0
Sat, 08 Dec 2018 04:58:33 GMT

### Minor changes

- streamlines API so the logger is not from the this context

## 0.4.2
Fri, 07 Dec 2018 22:20:28 GMT

### Patches

- fix: pass the right argv to the consumers

## 0.4.1
Fri, 07 Dec 2018 22:10:50 GMT

### Patches

- fix: makes conditon() work with series and parallel

## 0.4.0
Fri, 07 Dec 2018 18:17:23 GMT

### Minor changes

- Adds a 'condition' task function that can decide whether to skip task or not

## 0.3.1
Fri, 07 Dec 2018 17:16:09 GMT

### Patches

- Adds resilience to CLI script

## 0.3.0
Wed, 05 Dec 2018 22:16:09 GMT

### Minor changes

- Rename rig bin script to just

## 0.2.0
Wed, 05 Dec 2018 22:01:31 GMT

### Minor changes

- Renamed to just

## 1.2.6
Tue, 04 Dec 2018 06:13:37 GMT

### Patches

- Fixes globally installed just-task to check for local copy

## 1.2.5
Tue, 04 Dec 2018 05:15:26 GMT

### Patches

- Fixed help command to actually list commands

## 1.2.4
Mon, 03 Dec 2018 22:48:20 GMT

### Patches

- better failure logging and documentation

## 1.2.3
Mon, 03 Dec 2018 22:24:03 GMT

### Patches

- Fixed default tasks

## 1.2.2
Mon, 03 Dec 2018 22:04:01 GMT

### Patches

- Adding tests

## 1.2.1
Mon, 03 Dec 2018 18:39:51 GMT

### Patches

- Adds better failure logging messages

## 1.2.0
Mon, 03 Dec 2018 06:31:09 GMT

### Minor changes

- Adds default task support 

## 1.1.0
Mon, 03 Dec 2018 05:18:13 GMT

### Minor changes

- Added some readme and add support for yargs command module in task definition

## 1.0.1
Mon, 03 Dec 2018 00:54:11 GMT

### Patches

- adding blank line to test publish

## 1.0.0
Sun, 02 Dec 2018 03:50:30 GMT

*Initial release*
