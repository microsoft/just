import yargs from 'yargs';
import { initCommand } from './commands/initCommand';
import { addPackageCommand } from './commands/addPackageCommand';

yargs
  .command({
    aliases: '*',
    command: 'init',
    describe: 'Creates a brand new repository',
    handler: initCommand
  })
  .command({
    command: 'add <package>',
    describe: 'Adds a new package in the packages folder of a mono-repo',
    handler: addPackageCommand
  })
  .help().argv;
