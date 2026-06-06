import { undertaker } from './undertaker';
import { option, parseCommand } from './option';
import { logger } from './logger';
import { readConfig } from './config';
import { task } from './task';
import type { MaybeWrappedTaskFunction } from './wrapTask';

function showHelp() {
  const tasks = undertaker.registry().tasks() as Record<string, MaybeWrappedTaskFunction>;

  console.log('All the tasks that are available to just:');

  for (const [name, wrappedTask] of Object.entries(tasks)) {
    const unwrapped = wrappedTask.unwrap ? wrappedTask.unwrap() : wrappedTask;
    const description = unwrapped.description;
    console.log(`  ${name}${description ? `: ${description}` : ''}`);
  }
}

// Define a built-in option of "config" so users can specify which path to choose for configurations
option('config', {
  describe: 'path to a just configuration file (includes the file name, e.g. /path/to/just.config.ts)',
});
option('defaultConfig', {
  describe:
    'path to a default just configuration file that will be used when the current project does not have a just configuration file. (includes the file name, e.g. /path/to/just.config.ts)',
});
option('esm', {
  describe:
    'Configure ts-node to support imports of ESM package (changes TS module/moduleResolution settings to Node16)',
});

const registry = undertaker.registry();

const configModule = readConfig();

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
