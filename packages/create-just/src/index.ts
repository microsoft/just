import yargs from 'yargs';
import { initCommand } from './commands/initCommand';

yargs
  .command({
    aliases: '*',
    command: 'init [name]',
    builder: yargs =>
      yargs.option('stack', { describe: 'Stack to generate (e.g. just-stack-single-lib, just-stack-monorepo)', alias: ['s'] }),
    describe: 'Creates a brand new repository',
    handler: initCommand
  })
  .help().argv;
