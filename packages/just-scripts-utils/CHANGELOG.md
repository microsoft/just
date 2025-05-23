# Change Log - just-scripts-utils

<!-- This log was last generated on Fri, 28 Mar 2025 08:01:48 GMT and should not be manually modified. -->

<!-- Start content -->

## 2.1.0

Fri, 28 Mar 2025 08:01:48 GMT

### Minor changes

- Build with TypeScript 4.5 (elcraig@microsoft.com)
- Bump just-task-logger to v1.3.0

## 2.0.1

Tue, 12 Sep 2023 08:02:05 GMT

### Patches

- Update dependency fs-extra to v11 (renovate@whitesourcesoftware.com)

## 2.0.0

Thu, 09 Mar 2023 08:02:09 GMT

### Major changes

- Remove unused `prettyPrintMarkdown` function and related deps (`marked`, `marked-terminal`) (elcraig@microsoft.com)
- Remove unused `findMonoRepoRootPath` function (elcraig@microsoft.com)
- Remove unused functions `rushUpdate`, `readRushJson`, `rushAddPackage` and related dep `jju` (elcraig@microsoft.com)
- Bump just-task-logger to v1.2.1

### Patches

- Remove unused dep on `yargs` (elcraig@microsoft.com)
- Remove unused deps on `glob` and `tar` (elcraig@microsoft.com)

## 1.2.1

Thu, 09 Mar 2023 05:44:11 GMT

### Patches

- Update dependency marked-terminal to v5 (renovate@whitesourcesoftware.com)

## 1.2.0

Fri, 18 Nov 2022 22:40:12 GMT

### Minor changes

- Require Node 14 (elcraig@microsoft.com)
- Bump just-task-logger to v1.2.0

## 1.1.7

Sat, 10 Sep 2022 08:02:45 GMT

### Patches

- Update dependency fs-extra to v10 (email not defined)

## 1.1.6

Sat, 10 Sep 2022 00:19:03 GMT

### Patches

- Specify Node 12+ engines requirement (elcraig@microsoft.com)
- Bump just-task-logger to v1.1.2

## 1.1.5

Thu, 27 Jan 2022 23:06:07 GMT

### Patches

- Bump marked to 4.0.12 (elcraig@microsoft.com)
- Remove unused handlebars dep (elcraig@microsoft.com)

## 1.1.4

Wed, 04 Aug 2021 17:43:24 GMT

### Patches

- Bump tar from 6.1.0 to 6.1.6 (not specified)

## 1.1.3

Tue, 13 Jul 2021 17:19:50 GMT

### Patches

- Error when parallel process is terminated (iancra@microsoft.com)

## 1.1.2

Tue, 09 Feb 2021 03:08:41 GMT

### Patches

- Bump marked to 2.0.0 (dannyvv@microsoft.com)

## 1.1.1

Thu, 14 Jan 2021 20:55:06 GMT

### Patches

- fixing release pipeline and the empty lib folder (kchau@microsoft.com)

## 1.1.0

Wed, 13 Jan 2021 23:22:52 GMT

### Minor changes

- Update typescript and other dependencies (elcraig@microsoft.com)

### Patches

- Bump just-task-logger to v1.1.0 (elcraig@microsoft.com)

## 1.0.3

Mon, 02 Nov 2020 18:02:45 GMT

### Patches

- Update marked dependency to latest (1581488+christiango@users.noreply.github.com)

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

## 0.9.1

Fri, 12 Jun 2020 00:43:50 GMT

### Patches

- Fix downloadPackage unit test on clients running Node 12. (jagore@microsoft.com)

## 0.9.0
Mon, 13 Apr 2020 15:57:30 GMT

### Minor changes

- Add execSync utility (elcraig@microsoft.com)
## 0.8.4
Tue, 13 Aug 2019 21:00:51 GMT

### Patches

- Upgraded marked to 0.7.0 and marked-terminal to 3.3.0 (altinokd@microsoft.com)

## 0.8.3
Mon, 05 Aug 2019 06:10:22 GMT

### Patches

- Switches to using plop.js for codegen (kchau@microsoft.com)

## 0.8.2
Mon, 01 Jul 2019 20:15:20 GMT

### Patches

- introduce ESLint to sources (43081j@users.noreply.github.com)

## 0.8.1
Wed, 12 Jun 2019 02:03:29 GMT

## 0.8.1
Wed, 12 Jun 2019 01:49:55 GMT

## 0.8.1
Sat, 01 Jun 2019 04:59:34 GMT

### Patches

- Fix downloadPackage tests

## 0.8.0
Fri, 31 May 2019 21:15:02 GMT

### Minor changes

- Adds the ability to override registry in downloadPackage

## 0.7.3
Wed, 15 May 2019 18:44:04 GMT

### Patches

- Switch microsoft in repo URL to lowercase

## 0.7.2
Thu, 25 Apr 2019 18:29:49 GMT

### Patches

- Fix #78 by using Spawn instead of Exec

## 0.7.1
Wed, 24 Apr 2019 23:38:23 GMT

### Patches

- up dep
- add ability to use path for template

## 0.7.0
Wed, 10 Apr 2019 20:30:38 GMT

### Minor changes

- Fixing up the temp path to also use version in path

## 0.6.1
Tue, 12 Mar 2019 20:07:18 GMT

### Patches

- Exec error handling improvements

## 0.6.0
Fri, 22 Feb 2019 23:37:36 GMT

### Minor changes

- Consistent interface naming

## 0.5.0
Fri, 22 Feb 2019 22:50:01 GMT

### Minor changes

- Move exec to just-scripts-utils

## 0.4.2
Fri, 22 Feb 2019 19:03:38 GMT

### Patches

- Update package metadata

## 0.4.1
Thu, 21 Feb 2019 23:25:53 GMT

### Patches

- Use new logger package

## 0.4.0
Wed, 13 Feb 2019 22:31:47 GMT

### Minor changes

- API updates and error checking

## 0.3.3
Mon, 04 Feb 2019 05:47:04 GMT

### Patches

- flexibility change

## 0.3.2
Fri, 25 Jan 2019 07:08:59 GMT

### Patches

- Fixes

## 0.3.1
Wed, 23 Jan 2019 00:05:38 GMT

### Patches

- info as it is adding package

## 0.3.0
Tue, 22 Jan 2019 22:31:23 GMT

### Minor changes

- move utils from scripts to here

## 0.2.2
Mon, 21 Jan 2019 03:27:17 GMT

### Patches

- fix scripts to transform correctly with subdirs

## 0.2.1
Mon, 21 Jan 2019 02:54:15 GMT

### Patches

- fix upgrade stack task

## 0.2.0
Mon, 21 Jan 2019 02:21:01 GMT

### Minor changes

- new publish!
