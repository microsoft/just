import * as path from 'path';
import { argv } from './option';
import { resolve } from './resolve';
import { mark, logger } from 'just-task-logger';
import { enableTypeScript } from './enableTypeScript';
import { TaskFunction } from './interfaces';
import { readPackageJson } from 'just-scripts-utils';

export async function resolveConfigFile(args: { config?: string; defaultConfig?: string }): Promise<string | null> {
  // Check for the old config paths/extensions first
  const paths = [
    args.config,
    './just.config.js',
    './just-task.js',
    ...['.ts', '.cts', '.mts', '.cjs', '.mjs'].map(ext => `./just.config${ext}`),
    args.defaultConfig,
  ];

  for (const entry of paths) {
    const resolved = entry && resolve(entry);
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

  const packageJson = readPackageJson(process.cwd());
  const packageIsESM = packageJson?.type === 'module';

  const ext = path.extname(configFile).toLowerCase();

  if (/^\.[cm]?ts$/.test(ext)) {
    const tsSuccess = enableTypeScript({ transpileOnly: true, configFile });
    if (!tsSuccess) {
      process.exit(1); // enableTypeScript will log the error
    }
  }

  let configModule = undefined;
  try {
    if (ext.startsWith('.m') || (packageIsESM && !ext.startsWith('.c'))) {
      configModule = await import(configFile);
    } else {
      configModule = require(configFile);
    }
  } catch (e) {
    logger.error(`Error loading configuration file: ${configFile}`);
    logger.error((e as Error).stack || (e as Error).message || e);

    if (ext === '.mts' || (packageIsESM && ext === '.ts')) {
      // We can't directly support these with ts-node because we're calling register() rather than
      // creating a child process with the custom --loader.
      // (Related: https://typestrong.org/ts-node/docs/imports/)
      const binPath = path.relative(process.cwd(), process.argv[1]);
      logger.error('');
      logger.error(
        'Just does not directly support ESM TypeScript configuration files. You must either ' +
          `use a .cts file, or call the just binary (${binPath}) via ts-node or tsx.`,
      );
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
