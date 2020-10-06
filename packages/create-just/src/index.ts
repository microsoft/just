import parser = require('yargs-parser');
import { initCommand } from './commands/initCommand';
import { initialize } from './getEnvInfo';

const args = parser(process.argv.slice(2), {
  alias: {
    name: ['n'],
    stack: ['s'],
    registry: ['r']
  }
});

if (args._.length > 0) {
  args.name = args._[0];
}

(async () => {
  await initialize();
  initCommand(args);
})();

/*yargs
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
*/
