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
  if (!process.env.JUST_TASK_TS && (ext === '.mts' || (packageIsESM && ext === '.ts'))) {
    const configType = ext === '.mts' ? 'explicit .mts config' : '.ts config in an ESM package';
    const binName = path.basename(process.argv[1]).split('.')[0];
    logger.error(
      `To use a ${configType}, you must use ${binName}-esm. (Alternatively, you can change the config to .cts.)`,
    );
    process.exit(1);
  }

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
    process.exit(1);
  }

  mark('registry:configModule');

  if (typeof configModule === 'function') {
    try {
      await configModule();
    } catch (e) {
      logger.error(`Error running function from configuration file: ${configFile}`);
      logger.error((e as Error).stack || (e as Error).message || e);
      process.exit(1);
    }
  }

  logger.perf('registry:configModule');

  return configModule;
}
