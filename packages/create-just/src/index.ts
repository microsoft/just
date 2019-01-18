import yargs from 'yargs';
import { initCommand } from './commands/initCommand';

const argv = yargs
  .usage('$0 [args]')
  .help()
  .parse();

(async () => {
  await initCommand(argv);
})();
