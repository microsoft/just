import fs from 'fs';

import { argv } from './option';
import { resolve } from './resolve';
import { mark, logger } from './logger';
import { importModule } from './importModule';
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
    './just.config.mjs',
    './just.config.mts',
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

/** Load configs natively while retaining the original exports of imported CommonJS modules. */
export async function readConfig(): Promise<ConfigExports | void> {
  // uses a separate instance of yargs to first parse the config (without the --help in the way) so we can parse the configFile first regardless
  const args = argv();
  const configFile = resolveConfigFile(args);

  if (configFile && fs.existsSync(configFile)) {
    try {
      const importedConfig = await importModule(configFile);
      // import() wraps CommonJS exports in a namespace. Recover the original exports from Node's
      // real-path cache only if they match the namespace's default, leaving genuine ESM exports intact.
      const commonjsModule = require.cache[fs.realpathSync(configFile)];
      let configModule = (
        commonjsModule && commonjsModule.exports === importedConfig.default ? commonjsModule.exports : importedConfig
      ) as ConfigExports | (() => void | Promise<void>) | undefined;
      // Unwrap a default-only config, ignoring __esModule (transpiler interop) and module.exports
      // (Node's CommonJS namespace marker). If other exports exist, keep the task map instead:
      // "default" may be a task name, not an initializer to run while loading the config.
      if (
        typeof configModule === 'object' &&
        configModule.default &&
        Object.keys(configModule).every(key => ['default', '__esModule', 'module.exports'].includes(key))
      ) {
        configModule = configModule.default as unknown as ConfigExports | (() => void | Promise<void>);
      }

      mark('registry:configModule');

      if (typeof configModule === 'function') {
        await configModule();
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
    process.exitCode = 1;
  }
}
