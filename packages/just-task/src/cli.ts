import { undertaker } from './undertaker';
import { JustTaskRegistry } from './JustTaskRegistry';
import yargs from 'yargs';

yargs
  .option({ config: { describe: 'path to a just-task.js file (includes the file name)' } })
  .usage('$0 <cmd> [options]')
  .updateStrings({
    'Commands:': 'Tasks:\n'
  });

const registry = new JustTaskRegistry();

undertaker.registry(registry);

yargs.parse();
