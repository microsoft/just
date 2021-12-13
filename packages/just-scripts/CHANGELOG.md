# Change Log - just-scripts

This log was last generated on Mon, 13 Dec 2021 23:44:49 GMT and should not be manually modified.

<!-- Start content -->

## 1.6.0

Mon, 13 Dec 2021 23:44:49 GMT

### Minor changes

- Add option to modify API Extractor config before executing (elcraig@microsoft.com)

## 1.5.8

Fri, 10 Sep 2021 23:58:46 GMT

### Patches

- Bump just-scripts to v1.5.8 (kchau@microsoft.com)

## 1.5.7

Wed, 04 Aug 2021 17:43:24 GMT

### Patches

- Bump just-scripts-utils to v1.1.4 (not specified)

## 1.5.6

Tue, 13 Jul 2021 21:45:44 GMT

### Patches

- add semver to just-scripts (jcreamer@microsoft.com)

## 1.5.5

Tue, 13 Jul 2021 17:19:50 GMT

### Patches

- Bump just-scripts-utils to v1.1.3 (iancra@microsoft.com)

## 1.5.4

Thu, 15 Apr 2021 19:00:12 GMT

### Patches

- Bump just-task to v1.4.1 (kchau@microsoft.com)

## 1.5.3

Fri, 02 Apr 2021 23:21:50 GMT

### Patches

- Bump just-task to v1.4.0 (kchau@microsoft.com)

## 1.5.2

Mon, 22 Mar 2021 20:50:50 GMT

### Patches

- esbuild to resolve from cwd first then resolved paths (kchau@microsoft.com)

## 1.5.1

Mon, 22 Mar 2021 20:32:55 GMT

### Patches

- adds esbuildTask to public API (kchau@microsoft.com)

## 1.5.0

Mon, 22 Mar 2021 19:48:18 GMT

### Minor changes

- adding esbuild to just-scripts (kchau@microsoft.com)

## 1.4.2

Sat, 20 Mar 2021 00:45:10 GMT

### Patches

- Bump just-task to v1.3.0 (kchau@microsoft.com)

## 1.4.1

Thu, 18 Feb 2021 18:52:18 GMT

### Patches

- Add support for jest config in package.json. (afoxman@microsoft.com)

## 1.4.0

Sat, 13 Feb 2021 01:45:18 GMT

### Minor changes

- Add silent option to jest task to match Jest CLI --silent (iancra@microsoft.com)

## 1.3.3

Tue, 09 Feb 2021 03:08:41 GMT

### Patches

- Bump just-scripts-utils to v1.1.2 (dannyvv@microsoft.com)

## 1.3.2

Tue, 26 Jan 2021 23:51:57 GMT

### Patches

- Bump just-task to v1.2.0 (dannyvv@microsoft.com)

## 1.3.1

Thu, 14 Jan 2021 20:55:06 GMT

### Patches

- fixing release pipeline and the empty lib folder (kchau@microsoft.com)

## 1.3.0

Wed, 13 Jan 2021 23:22:52 GMT

### Minor changes

- making webpackDevServerTask work with newer webpack-cli versions; webpack config are picked up more naturally like webpack-cli (kchau@microsoft.com)
- Update typescript and other dependencies (elcraig@microsoft.com)

### Patches

- Bump just-scripts-utils to v1.1.0 (elcraig@microsoft.com)
- Bump just-task to v1.1.0 (elcraig@microsoft.com)

## 1.2.6

Mon, 09 Nov 2020 22:25:49 GMT

### Patches

- Use just-script-utils version of spawn in order to properly forward OOMs. (jagore@microsoft.com)

## 1.2.3

Mon, 02 Nov 2020 16:26:27 GMT

### Patches

- Publish src folder (1581488+christiango@users.noreply.github.com)

## 1.2.2

Tue, 27 Oct 2020 22:47:26 GMT

### Patches

- Error if explicit webpack config path does not exist (iancra@microsoft.com)

## 1.2.1

Thu, 22 Oct 2020 16:37:05 GMT

### Patches

- Do not crash reporting errors in Webpack 5 (1581488+christiango@users.noreply.github.com)

## 1.2.0

Fri, 09 Oct 2020 21:11:51 GMT

### Minor changes

- adds a new nodeExecTask that optionally supports ts-node (kchau@microsoft.com)

## 1.1.0

Thu, 08 Oct 2020 21:11:16 GMT

### Minor changes

- enable typescript in webpack (kchau@microsoft.com)

## 1.0.0

Tue, 06 Oct 2020 23:06:25 GMT

### Major changes

- removed just-stack-* (kchau@microsoft.com)

### Patches

- Remove implicit SDI usage (darthtrevino@gmail.com)

## 0.44.7

Thu, 24 Sep 2020 21:26:58 GMT

### Patches

- undefined (kchau@microsoft.com)

## 0.44.6

Tue, 22 Sep 2020 23:11:37 GMT

### Patches

- making just-scripts the most screaming fast thing (kchau@microsoft.com)

## 0.44.5

Wed, 16 Sep 2020 00:18:39 GMT

### Patches

- API extractor task: create destination directory if it doesn't exist (elcraig@microsoft.com)

## 0.44.4

Mon, 10 Aug 2020 19:39:57 GMT

### Patches

- Don't overwrite options._ in jestTask (1581488+christiango@users.noreply.github.com)

## 0.44.3

Mon, 10 Aug 2020 19:24:56 GMT

### Patches

- Add support for --clearCache to jest task (1581488+christiango@users.noreply.github.com)

## 0.44.2

Mon, 03 Aug 2020 16:59:40 GMT

### Patches

- Remove 'npm-registry-fetch' dependency (rezha@microsoft.com)

## 0.44.1

Wed, 15 Jul 2020 00:35:09 GMT

### Patches

- ESLint task: Setting Timing value to environment variable. (vipati@microsoft.com)

## 0.44.0

Mon, 06 Jul 2020 19:35:46 GMT

### Minor changes

- Export spawn util. (jagore@microsoft.com)

## 0.43.4

Wed, 17 Jun 2020 20:52:36 GMT

### Patches

- Add unit tests for copy task. (jagore@microsoft.com)

## 0.43.2

Thu, 04 Jun 2020 22:56:59 GMT

### Patches

- adding nodeArgs arg to tscTask (kchau@microsoft.com)

## 0.43.1

Thu, 04 Jun 2020 22:11:04 GMT

### Patches

- Replacing cssnano with postcss-clean, which is more reliable. (dzearing@microsoft.com)

## 0.43.0

Tue, 02 Jun 2020 20:33:23 GMT

### Minor changes

- eslint task: fix config resolution and add options (elcraig@microsoft.com)

## 0.42.0

Mon, 01 Jun 2020 23:29:27 GMT

### Minor changes

- Removing sass warnings about missing plugins. (dzearing@microsoft.com)
- Use updated options to autoprefixer (jdh@microsoft.com)

## 0.41.0

Mon, 11 May 2020 20:26:03 GMT

### Minor changes

- Adding directional support to sass pipeline. (dzearing@microsoft.com)

## 0.40.0

Mon, 27 Apr 2020 18:15:47 GMT

### Minor changes

- Pretty print webpack stats on error instead of printing JSON (email not defined)
- Fix args passed to webpack.config.js function to match webpack spec (email not defined)
- webpackDevServerTask passes through webpackCliArgs to webpack-dev-server (iancra@microsoft.com)

### Patches

- bumping just-task dependency (kchau@microsoft.com)
- Fix API Extractor types (elcraig@microsoft.com)

## 0.39.0
Fri, 24 Apr 2020 17:42:34 GMT

### Minor changes

- Add 'noOpen' flag to tell webpack not to open browser page. (kinhln@microsoft.com)
## 0.38.0
Mon, 13 Apr 2020 15:57:30 GMT

### Minor changes

- Make API Extractor task accept all API Extractor options, and deprecate fixNewlines. Add shared Jest reporter. (elcraig@microsoft.com)
## 0.37.2
Fri, 10 Apr 2020 20:34:02 GMT

### Patches

- Jest now can take a positional arg to run a certain test pattern (kchau@microsoft.com)
## 0.37.1
Tue, 07 Apr 2020 17:35:38 GMT

### Patches

- another take on tar task using tar-fs instead because it can actually handle large amounts of data (kchau@microsoft.com)
## 0.37.0
Mon, 06 Apr 2020 21:43:56 GMT

### Minor changes

- Adds a new set of tar create and extract tasks (kchau@microsoft.com)
## 0.36.1
Wed, 13 Nov 2019 19:42:46 GMT

### Patches

- adding options to turn off colors (kchau@microsoft.com)
## 0.36.0
Mon, 11 Nov 2019 21:09:42 GMT

### Minor changes

- api-extractor task: add callback to access ExtractorResult, add typings, improve logic (elcraig@microsoft.com)
## 0.35.0
Thu, 07 Nov 2019 04:07:08 GMT

### Minor changes

- adding environment variable support for jestTask (kchau@microsoft.com)
## 0.34.1
Mon, 04 Nov 2019 20:25:32 GMT

### Patches

- get rid of force exit for jest task as it masks the real test problems (kchau@microsoft.com)
## 0.34.0
Thu, 31 Oct 2019 21:15:50 GMT

### Minor changes

- adds a plain old webpack-cli task (kchau@microsoft.com)
## 0.33.0
Wed, 23 Oct 2019 15:48:00 GMT

### Minor changes

- Add a "project" option to the tslint task (matthias.klass@gmail.com)
## 0.32.1
Fri, 18 Oct 2019 22:08:36 GMT

### Patches

- bump just-task (kchau@microsoft.com)
## 0.32.0
Fri, 18 Oct 2019 20:08:37 GMT

### Minor changes

- bumps just-task dependency (kchau@microsoft.com)
## 0.31.1
Fri, 27 Sep 2019 23:36:14 GMT

### Patches

- fixes tsoverlay checkeroption to be empty (odbuild@microsoft.com)
## 0.31.0
Fri, 27 Sep 2019 17:06:38 GMT

### Minor changes

- adding loaderoptions for tsoverlay (odbuild@microsoft.com)
## 0.30.0
Fri, 27 Sep 2019 16:10:48 GMT

### Minor changes

- Add option to fix API report file newlines (elcraig@microsoft.com)
## 0.29.0
Tue, 17 Sep 2019 19:23:34 GMT

### Minor changes

- feat: added webpack-cli tasks init, more to come (anik220798@gmail.com)
## 0.28.3
Mon, 16 Sep 2019 23:39:13 GMT

### Patches

- fixes styleoverlay (kchau@microsoft.com)
## 0.28.2
Mon, 26 Aug 2019 17:08:08 GMT

### Patches

- adds a forceexit flag to make sure timeouts don't hang the runner (kchau@microsoft.com)

## 0.28.1
Wed, 14 Aug 2019 18:36:20 GMT

### Patches

- Update just-scripts-utils version (altinokd@microsoft.com)

## 0.28.0
Wed, 07 Aug 2019 22:11:38 GMT

### Minor changes

- add resolvePluginsPath option, make it possible to set maxWarnings to 0 (andrewh@microsoft.com)

## 0.27.0
Mon, 05 Aug 2019 06:10:22 GMT

### Minor changes

- Getting rid of defunct just-stack / monorepo tasks (kchau@microsoft.com)

## 0.26.0
Fri, 19 Jul 2019 22:44:26 GMT

### Minor changes

- Support string array options. (ScottHysom@users.noreply.github.com)

## 0.25.4
Thu, 18 Jul 2019 18:05:47 GMT

### Patches

- Add unit tests for tscTask (ScottHysom@users.noreply.github.com)

## 0.25.3
Thu, 18 Jul 2019 17:09:22 GMT

### Patches

- fix: added default arguments (anik220798@gmail.com)

## 0.25.2
Wed, 10 Jul 2019 19:56:39 GMT

### Patches

- Only pass valid webpack options to webpack (1581488+christiango@users.noreply.github.com)

## 0.25.1
Wed, 10 Jul 2019 16:41:03 GMT

### Patches

- Add ability to set node args for webpack dev server (1581488+christiango@users.noreply.github.com)

## 0.25.0
Fri, 05 Jul 2019 16:59:55 GMT

### Minor changes

- allow webpacktask to take in promises inside the module exports (kchau@microsoft.com)

## 0.24.2
Mon, 01 Jul 2019 20:15:20 GMT

### Patches

- introduce ESLint to sources (43081j@users.noreply.github.com)

## 0.24.1
Mon, 01 Jul 2019 18:55:04 GMT

### Patches

- fixes build cache so packages can have different path name than package name (kchau@microsoft.com)

## 0.24.0
Wed, 26 Jun 2019 02:35:13 GMT

### Minor

- Add extensions option Move no-eslintrc as seperate option Code cleanup (mmoe@stibosystems.com)

## 0.23.1
Tue, 18 Jun 2019 06:34:34 GMT

### Patches

- sorting lines - creating a patch release (kchau@microsoft.com)

## 0.23.0
Tue, 18 Jun 2019 05:17:16 GMT

### Minor

- New task: ESLint (kchau@microsoft.com)

## 0.22.1
Fri, 14 Jun 2019 17:24:38 GMT

### Patches

- Don't override default webpack extensions (kchau@microsoft.com)

## 0.22.0
Thu, 13 Jun 2019 21:35:38 GMT

### Minor

- makes clean also clean out the cache (kchau@microsoft.com)

## 0.21.1
Thu, 13 Jun 2019 21:16:34 GMT

### Patches

- fixes the running message (kchau@microsoft.com)

## 0.21.0
Wed, 12 Jun 2019 22:24:44 GMT

### Minor

- supports tsc build project ref mode (kchau@microsoft.com)

## 0.20.0
Wed, 12 Jun 2019 02:03:29 GMT

## 0.20.0
Wed, 12 Jun 2019 01:49:55 GMT

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
