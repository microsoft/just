import fs from 'fs';
import path from 'path';

import { argv } from './option';
import { resolve } from './resolve';
import { mark, logger } from './logger';
import { enableTypeScript } from './enableTypeScript';
import type yargsParser from 'yargs-parser';
import type { TaskFunction } from './interfaces';

export function resolveConfigFile(args: yargsParser.Arguments): string | null {
  for (const entry of [
    args.config as string | undefined,
    './just.config.js',
    './just.config.cjs',
    './just-task.js',
    './just.config.ts',
    './just.config.cts',
    args.defaultConfig as string | undefined,
  ]) {
    const configFile = entry && resolve(entry);
    if (configFile) {
      return configFile;
    }
  }

  return null;
}

type ConfigExports = Record<string, TaskFunction>;

export function readConfig(): ConfigExports | void {
  // uses a separate instance of yargs to first parse the config (without the --help in the way) so we can parse the configFile first regardless
  const args = argv();
  const configFile = resolveConfigFile(args);

  if (configFile && fs.existsSync(configFile)) {
    const ext = path.extname(configFile);
    if (ext === '.cts' || ext === '.ts' || ext === '.tsx') {
      // TODO: add option to do typechecking as well
      enableTypeScript({ transpileOnly: true, esm: args.esm as boolean | undefined });
    }

    try {
      let configModule = require(configFile) as ConfigExports | (() => ConfigExports) | undefined;
      // If the module only has a default export, use that as the config. (A config file can also
      // export named task functions, and theoretically a task could be called "default", so
      // ignore the default export if there are other exports alongside it.)
      if (typeof configModule === 'object' && configModule.default && Object.keys(configModule).length === 1) {
        configModule = configModule.default as unknown as ConfigExports | (() => ConfigExports);
      }

      mark('registry:configModule');

      if (typeof configModule === 'function') {
        configModule();
        configModule = undefined;
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
