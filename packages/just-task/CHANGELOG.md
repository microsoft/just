# Change Log - just-task

This log was last generated on Tue, 22 Jan 2019 21:28:18 GMT and should not be manually modified.

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

