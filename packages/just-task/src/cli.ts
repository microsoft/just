import { undertaker } from './undertaker';
import { JustTaskRegistry } from './JustTaskRegistry';
import yargs from 'yargs';

const originalEmitWarning = process.emitWarning;
process.emitWarning = function emitWarning(warning: string | Error, name?: string, ctor?: Function) {
  if (name === 'DEP0097') {
    // Undertaker uses a deprecated approach that causes NodeJS 10 to print
    // this warning to stderr:
    //
    // "Using a domain property in MakeCallback is deprecated. Use the  async_context
    // variant of MakeCallback or the AsyncResource class instead."

    // Suppress the warning!
    return;
  }

  return originalEmitWarning(warning, name, ctor);
};

yargs
  .option({ config: { describe: 'path to a just-task.js file (includes the file name)' } })
  .usage('$0 <cmd> [options]')
  .updateStrings({
    'Commands:': 'Tasks:\n'
  });

const registry = new JustTaskRegistry();

undertaker.registry(registry);

yargs.parse();
