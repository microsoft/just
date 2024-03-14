import * as path from 'path';
import { argv } from './option';
import { resolve } from './resolve';
import { mark, logger } from 'just-task-logger';
import { enableTypeScript } from './enableTypeScript';
import { TaskFunction } from './interfaces';

export async function resolveConfigFile(args: { config?: string; defaultConfig?: string }): Promise<string | null> {
  // Check for the old config paths/extensions first
  const paths = [
    args.config,
    './just.config.js',
    './just-task.js',
    './just.config.ts',
    // Add .cjs and .mjs (.cts and .mts don't seem to work with ts-node)
    './just.config.cjs',
    './just.config.mjs',
    args.defaultConfig,
  ].filter((p): p is string => !!p);

  for (const entry of paths) {
    const resolved = resolve(entry);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export async function readConfig(): Promise<{ [key: string]: TaskFunction } | void> {
  // uses a separate instance of yargs to first parse the config (without the --help in the way)
  // so we can parse the configFile first regardless
  const args = argv() as { config?: string; defaultConfig?: string };
  const configFile = await resolveConfigFile(args);

  if (!configFile) {
    logger.error('Config file not found. Please create a file "just.config.js" at the package root.');
    process.exit(1);
  }

  const ext = path.extname(configFile).toLowerCase();

  if (ext === '.ts') {
    enableTypeScript({ transpileOnly: true });
  }

  let configModule = undefined;
  let importError: unknown;
  try {
    try {
      if (ext !== '.cjs') {
        // Rather than trying to infer the correct type in all cases, try import first.
        configModule = await import(configFile);
      }
    } catch (e) {
      importError = e;
    }
    // Fall back to require
    configModule ||= require(configFile);
  } catch (e) {
    logger.error(`Invalid configuration file: ${configFile}`);
    if (importError) {
      logger.error(
        `Initially got this error trying to import() the file:\n${
          (importError as Error)?.stack || (importError as Error)?.message || importError
        }`,
      );
      logger.error(
        `Then tried to require() the file and got this error:\n${(e as Error).stack || (e as Error).message || e}`,
      );
    } else {
      logger.error((e as Error).stack || (e as Error).message || e);
    }

    process.exit(1);
  }

  mark('registry:configModule');

  if (typeof configModule === 'function') {
    try {
      await configModule();
    } catch (e) {
      logger.error(`Invalid configuration file: ${configFile}`);
      logger.error(`Error running config function: ${(e as Error).stack || (e as Error).message || e}`);
      process.exit(1);
    }
  }

  logger.perf('registry:configModule');

  return configModule;
}
