import yargs from 'yargs';
import { initCommand } from './commands/initCommand';
import { createPackageCommand } from './commands/createPackageCommand';

yargs
  .command({
    aliases: '*',
    command: 'init',
    describe: 'Creates a brand new repository',
    handler: initCommand
  })
  .command({
    command: 'create <name>',
    aliases: ['package', 'pkg'],
    describe: 'Creates a new package in the packages folder',
    builder: yargs => yargs.option('type', { default: 'web', alias: 't' }),
    handler: createPackageCommand
  })
  .help().argv;
