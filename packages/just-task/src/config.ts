import * as fs from 'fs';
import * as path from 'path';

import { argv } from './option';
import { resolve } from './resolve';
import { mark, logger } from 'just-task-logger';
import { readPackageJson } from 'just-scripts-utils';
import { enableTypeScript } from './enableTypeScript';
import yargsParser = require('yargs-parser');
import { TaskFunction } from './interfaces';

export function resolveConfigFile(args: yargsParser.Arguments): string | null {
  const paths = [
    args.config,
    './just.config.js',
    './just-task.js',
    './just.config.ts',
    './just.config.cjs',
    './just.config.cts',
    args.defaultConfig,
  ].filter(Boolean);

  for (const entry of paths) {
    const configFile = resolve(entry);
    if (configFile) {
      return configFile;
    }
  }

  return null;
}

export async function readConfig(): Promise<{ [key: string]: TaskFunction } | void> {
  // uses a separate instance of yargs to first parse the config (without the --help in the way)
  // so we can parse the configFile first regardless
  const args = argv();
  const configFile = resolveConfigFile(args);
  const packageJson = readPackageJson(process.cwd());
  const packageIsESM = packageJson?.type === 'module';

  if (!configFile) {
    const newConfigName = packageIsESM ? 'just.config.cjs' : 'just.config.js';
    logger.error(
      `Config file not found! Please create a file called "${newConfigName}" ` +
        `in the root of the project next to "package.json".`,
    );
    process.exit(1);
  }

  if (!fs.existsSync(configFile)) {
    logger.error(`The specified config file "${configFile}" doesn't exit or couldn't be resolved.`);
    process.exit(1);
  }

  const esmMessage = `
Just currently does not support ESM for the config file (${configFile}).
Ensure the file has a .cjs or .cts extension and change any top-level imports to require.

If you need to load an ES module in the config, use dynamic import() within an async function${
    // this new mode is automatically enabled for ESM packages
    packageIsESM ? '' : `\nand pass the --esm flag to just-scripts`
  }.
(Task functions may be async, and the config file may export an async function as module.exports.)
`;

  const configContents = fs.readFileSync(configFile, 'utf8');
  const ext = path.extname(configFile).toLowerCase();
  const isTS = /^\.[cm]?tsx?$/.test(ext);

  // Check for common ESM patterns before requiring the file
  if (
    // Explicit ESM extension
    ext.startsWith('.m') ||
    // ESM package: .js or .ts files will be implicitly handled as ESM
    (packageIsESM && !ext.startsWith('.c')) ||
    // JS or explicit .cts file with top-level import
    ((!isTS || ext.startsWith('.cts')) && /^import /m.test(configContents))
  ) {
    logger.error(esmMessage);
    process.exit(1);
  }

  if (isTS) {
    enableTypeScript({ transpileOnly: true, esm: args.esm || packageIsESM });
  }

  try {
    const configModule = require(configFile);

    mark('registry:configModule');

    if (typeof configModule === 'function') {
      await configModule();
    }

    logger.perf('registry:configModule');

    return configModule;
  } catch (e) {
    logger.error(`Invalid configuration file: ${configFile}`);
    logger.error(`Error: ${e.stack || e.message || e}`);

    if (
      // config or something it required was an ES module
      // (or it used a dynamic import() in a non-ESM package without the --esm flag)
      e.code === 'ERR_REQUIRE_ESM' ||
      // import in a CJS module
      (e.name === 'SyntaxError' && /\bimport\b/.test(e.message || '')) ||
      // require in an ES module
      (e.name === 'ReferenceError' && /\brequire\b/.test(e.message || ''))
    ) {
      logger.error(esmMessage);
    }

    process.exit(1);
  }
}
