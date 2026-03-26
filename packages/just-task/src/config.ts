import * as fs from 'fs';

import { argv } from './option';
import { resolve } from './resolve';
import { mark, logger } from './logger';
import yargsParser = require('yargs-parser');
import { TaskFunction } from './interfaces';

export function resolveConfigFile(args: yargsParser.Arguments): string | null {
  for (const entry of [
    args.config,
    './just.config.js',
    './just.config.cjs',
    './just.config.mjs',
    './just-task.js',
    './just.config.ts',
    './just.config.cts',
    './just.config.mts',
    args.defaultConfig,
  ]) {
    const configFile = resolve(entry);
    if (configFile) {
      return configFile;
    }
  }

  return null;
}

export function readConfig(): { [key: string]: TaskFunction } | void {
  // uses a separate instance of yargs to first parse the config (without the --help in the way) so we can parse the configFile first regardless
  const args = argv();
  const configFile = resolveConfigFile(args);

  if (configFile && fs.existsSync(configFile)) {
    try {
      const configModule = require(configFile);

      mark('registry:configModule');

      if (typeof configModule === 'function') {
        configModule();
      }

      logger.perf('registry:configModule');

      return configModule;
    } catch (e) {
      logger.error(`Invalid configuration file: ${configFile}`);
      logger.error(`Error: ${(e as Error).stack || (e as Error).message || e}`);
      process.exit(1);
    }
  } else {
    logger.error(
      `Cannot find config file "${configFile}".`,
      `Please create a file called "just.config.js" in the root of the project next to "package.json".`,
    );
  }
}
