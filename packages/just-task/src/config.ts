import * as fs from 'fs';
import * as path from 'path';

import { argv } from './option';
import { resolve } from './resolve';
import { mark, logger } from './logger';
import { enableTypeScript } from './enableTypeScript';
import yargsParser = require('yargs-parser');
import { TaskFunction } from './interfaces';

export function resolveConfigFile(args: yargsParser.Arguments): string | null {
  for (const entry of [
    args.config,
    './just.config.js',
    './just.config.cjs',
    './just-task.js',
    './just.config.ts',
    './just.config.cts',
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
    const ext = path.extname(configFile);
    if (ext === '.cts' || ext === '.ts' || ext === '.tsx') {
      // TODO: add option to do typechecking as well
      enableTypeScript({ transpileOnly: true, esm: args.esm });
    }

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
