import { undertaker } from './undertaker';
import { option, parseCommand } from './option';
import { logger } from 'just-task-logger';
import { TaskFunction } from './interfaces';
import { readConfig } from './config';
import { task } from './task';

const originalEmitWarning = process.emitWarning;

(process.emitWarning as any) = function emitWarning(
  this: any,
  _warning: string,
  _type: string,
  code: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  _ctor?: Function,
) {
  if (code === 'DEP0097') {
    // Undertaker uses a deprecated approach that causes NodeJS 10 to print
    // this warning to stderr:
    //
    // "Using a domain property in MakeCallback is deprecated. Use the  async_context
    // variant of MakeCallback or the AsyncResource class instead."
    // Suppress the warning!
    return;
  }
  return originalEmitWarning.apply(this, arguments);
};

function showHelp() {
  const tasks = undertaker.registry().tasks();

  console.log('All the tasks that are available to just:');

  for (const [name, wrappedTask] of Object.entries(tasks)) {
    const unwrapped = (wrappedTask as any).unwrap ? (wrappedTask as any).unwrap() : (wrappedTask as TaskFunction);
    const description = (unwrapped as TaskFunction).description;
    console.log(`  ${name}${description ? `: ${description}` : ''}`);
  }
}

async function run() {
  // Define a built-in option of "config" so users can specify which path to choose for configurations
  option('config', {
    describe: 'path to a just configuration file, e.g. ./path/to/just.config.ts',
  });
  option('defaultConfig', {
    describe:
      'path to a default just configuration file that will be used when the current project does not have a just configuration file. ' +
      '(includes the file name, e.g. /path/to/just.config.ts)',
  });
  option('esm', {
    describe: 'No longer needed',
  });

  const registry = undertaker.registry();

  const configModule = await readConfig();

  // Support named task function as exports of a config module
  if (configModule && typeof configModule === 'object') {
    for (const taskName of Object.keys(configModule)) {
      if (typeof configModule[taskName] == 'function') {
        task(taskName, configModule[taskName]);
      }
    }
  }

  const command = parseCommand();

  if (command) {
    if (registry.get(command)) {
      undertaker.series(registry.get(command))(() => undefined);
    } else {
      logger.error(`Command not defined: ${command}`);
      process.exitCode = 1;
    }
  } else {
    showHelp();
  }
}

run().catch(e => {
  logger.error(e.stack || e.message || e);
  process.exit(1);
});
