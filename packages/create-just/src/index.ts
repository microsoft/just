import yargs from 'yargs';
import { initCommand } from './commands/initCommand';

yargs
  .command({
    aliases: '*',
    command: 'init [name]',
    builder: yargs =>
      yargs
        .option('stack', { describe: 'Stack to generate (e.g. just-stack-single-lib, just-stack-monorepo)', alias: ['s'] })
        .option('registry', { describe: 'Use an alternative registry (e.g. http://localhost:4873/)', alias: ['r'] }),
    describe: 'Creates a brand new repository',
    handler: initCommand
  })
  .help().argv;
