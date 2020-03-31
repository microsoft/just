import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { logger, mark } from './logger';

import UndertakerRegistry from 'undertaker-registry';
import Undertaker from 'undertaker';
import { resolve } from './resolve';
import { enableTypeScript } from './enableTypeScript';
import { TaskDefinitionRecord } from './TaskDefinitionRecord';

export class JustTaskRegistry extends UndertakerRegistry {
  private hasDefault: boolean = false;
  taker?: Undertaker;

  public init(taker: Undertaker) {
    super.init(taker);

    this.taker = taker;

    // uses a separate instance of yargs to first parse the config (without the --help in the way) so we can parse the configFile first regardless
    const configFile = [yargs.argv.config, './just.config.js', './just-task.js', './just.config.ts'].reduce(
      (value, entry) => value || resolve(entry)
    );

    mark('registry:configModule');

    if (configFile && fs.existsSync(configFile)) {
      const ext = path.extname(configFile);
      if (ext === '.ts' || ext === '.tsx') {
        // TODO: add option to do typechecking as well
        enableTypeScript({ transpileOnly: true });
      }

      try {
        const configModule = require(configFile);
        if (typeof configModule === 'function') {
          configModule();
        }
      } catch (e) {
        logger.error(`Invalid configuration file: ${configFile}`);
        logger.error(`Error: ${e.stack || e.message || e}`);
        process.exit(1);
      }
    } else {
      logger.error(
        `Cannot find config file "${configFile}".`,
        `Please create a file called "just.config.js" in the root of the project next to "package.json".`
      );
    }

    logger.perf('registry:configModule');

    if (!validateCommands(yargs)) {
      process.exit(1);
    }

    if (!this.hasDefault) {
      yargs.demandCommand(1, 'No default tasks are defined.').help();
    }
  }

  public set<TTaskFunction>(taskName: string, fn: TTaskFunction): TTaskFunction {
    super.set(taskName, fn);

    if (this.taker) {
      this.taker.emit('define', new TaskDefinitionRecord(taskName, getTruncatedStackTrace()));
    }
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

function getTruncatedStackTrace(): string {
  const stack = new Error().stack;
  if (!stack) return '';
  const lines = stack.split('\n');
  const searchString = __dirname;
  let lastInstanceOfJustTask = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(searchString) >= 0) {
      lastInstanceOfJustTask = i;
    }
  }
  return lines.slice(lastInstanceOfJustTask + 1).join('\n');
}
