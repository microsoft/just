import yargs from 'yargs';
import { initCommand } from './commands/initCommand';

yargs
  .command({
    aliases: '*',
    command: 'init',
    describe: 'Creates a brand new repository',
    handler: initCommand
  })
  .help().argv;
