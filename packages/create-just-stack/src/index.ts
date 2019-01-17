import yargs from 'yargs';
import { initRepoCommand } from './commands/initRepoCommand';
import { createPackageCommand } from './commands/createPackageCommand';

yargs
  .command({
    command: 'init',

    describe: 'Creates a brand new repository',
    handler: initRepoCommand
  })
  .command({
    command: 'create <name>',
    aliases: ['package', 'pkg'],
    describe: 'Creates a new package in the packages folder',
    builder: yargs => yargs.option('type', { default: 'web', alias: 't' }),
    handler: createPackageCommand
  })
  .help().argv;
