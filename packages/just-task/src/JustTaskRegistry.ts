import yargs from 'yargs';
import fs from 'fs';
import { logger } from './logger';

import UndertakerRegistry from 'undertaker-registry';
import Undertaker from 'undertaker';
import { resolve } from './resolve';

export class JustTaskRegistry extends UndertakerRegistry {
  private hasDefault: boolean = false;

  public init(taker: Undertaker) {
    super.init(taker);

    // uses a separate instance of yargs to first parse the config (without the --help in the way) so we can parse the configFile first regardless
    const configFile = [yargs.argv.config, './just.config.js', './just-task.js'].reduce((value, entry) => value || resolve(entry));

    if (configFile && fs.existsSync(configFile)) {
      try {
        const configModule = require(configFile);
        if (typeof configModule === 'function') {
          configModule();
        }
      } catch (e) {
        logger.error(`Invalid configuration file: ${configFile}`);
        logger.error(`Error: ${e.message || e}`);
      }
    } else {
      logger.error(
        `Cannot find config file "${configFile}".`,
        `Please create a file called "just.config.js" in the root of the project next to "package.json".`
      );
    }

    if (!validateCommands(yargs)) {
      process.exit(1);
    }

    if (!this.hasDefault) {
      yargs.demandCommand(1, 'No default tasks are defined.').help();
    }
  }

  public set<TTaskFunction>(taskName: string, fn: TTaskFunction): TTaskFunction {
    super.set(taskName, fn);

    if (taskName === 'default') {
      this.hasDefault = true;
    }

    return fn;
  }
}

function validateCommands(yargs: any) {
  const commandKeys = yargs.getCommandInstance().getCommands();
  const argv = yargs.argv;
  const unknown: string[] = [];
  const currentContext = yargs.getContext();

  if (commandKeys.length > 0) {
    argv._.slice(currentContext.commands.length).forEach((key: string) => {
      if (commandKeys.indexOf(key) === -1) {
        unknown.push(key);
      }
    });
  }

  if (unknown.length > 0) {
    logger.error(`Unknown command: ${unknown.join(', ')}`);

    const recommended = recommendCommands(unknown[0], commandKeys);

    if (recommended) {
      logger.info(`Did you mean this task name: ${recommended}?`);
    }

    return false;
  }

  return true;
}

function recommendCommands(cmd: string, potentialCommands: string[]) {
  const distance = require('yargs/lib/levenshtein');
  const threshold = 3; // if it takes more than three edits, let's move on.
  potentialCommands = potentialCommands.sort((a, b) => b.length - a.length);

  let recommended = null;
  let bestDistance = Infinity;
  for (let i = 0, candidate; (candidate = potentialCommands[i]) !== undefined; i++) {
    const d = distance(cmd, candidate);
    if (d <= threshold && d < bestDistance) {
      bestDistance = d;
      recommended = candidate;
    }
  }

  return recommended;
}
