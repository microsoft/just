import { logger, resolveCwd, argv, type TaskFunction } from 'just-task';
import { spawn, readPackageJson, logNodeCommand } from '../utils';
import { existsSync } from 'fs';
import supportsColor from 'supports-color';
import { resolveWrapper } from '../tryRequire';

export interface JestTaskOptions {
  config?: string;
  rootDir?: string;
  runInBand?: boolean;
  coverage?: boolean;
  updateSnapshot?: boolean;
  watch?: boolean;
  colors?: boolean;
  passWithNoTests?: boolean;
  clearCache?: boolean;
  silent?: boolean;
  /**
   * Compatible with jest 29 and below only. Use `testPathPatterns` for jest 30+.
   */
  testPathPattern?: string;
  /**
   * Compatible with jest 30+ only. Use `testPathPattern` for jest 29 and below.
   */
  testPathPatterns?: string;
  testNamePattern?: string;
  // The maximum number of workers to use in jest for parallel test execution
  maxWorkers?: number;
  u?: boolean;
  _?: string[];

  /**
   * Arguments to be passed into a spawn call for jest
   */
  nodeArgs?: string[];

  /**
   * Environment variables to be passed to the jest runner
   */
  env?: NodeJS.ProcessEnv;
}

/**
 * Create a task to run jest. Logs a warning if `jest` or a config file isn't found.
 */
export function jestTask(options: JestTaskOptions = {}): TaskFunction {
  const jestConfigFile = resolveCwd('./jest.config', { extensions: ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts'] });

  // undertaker apparently requires returning a promise, async function, or function that calls done()
  return async function jest() {
    const jestPath = 'jest/bin/jest.js';
    const jestCmd = resolveWrapper(jestPath);
    if (!jestCmd) {
      logger.warn(`jest CLI (${jestPath}) not found, so this task has no effect.`);
      return;
    }

    const configFile = options.config || jestConfigFile;
    const configFileExists = configFile && existsSync(configFile);

    let packageConfigExists = false;
    if (configFileExists) {
      logger.verbose(`Using jest config file ${configFile}`);
    } else {
      const packageConfig = readPackageJson(process.cwd());
      if (packageConfig && packageConfig.jest) {
        packageConfigExists = true;
        logger.verbose(`Using jest config from package.json`);
      }
    }

    if (!(configFileExists || packageConfigExists)) {
      logger.warn('No jest configuration found; skipping');
      return;
    }

    logger.info(`Running Jest`);

    const positional = argv()._.slice(1);

    const args = [
      ...(options.nodeArgs || []),
      jestCmd,
      ...(configFileExists ? ['--config', configFile] : []),
      ...(options.rootDir ? ['--rootDir', options.rootDir] : []),
      ...(options.passWithNoTests ? ['--passWithNoTests'] : []),
      ...(options.clearCache ? ['--clearCache'] : []),
      ...(options.colors !== false && supportsColor.stdout ? ['--colors'] : []),
      ...(options.runInBand ? ['--runInBand'] : []),
      ...(options.coverage ? ['--coverage'] : []),
      ...(options.watch ? ['--watch'] : []),
      ...(options.silent ? ['--silent'] : []),
      ...(options.testPathPattern ? ['--testPathPattern', options.testPathPattern] : []),
      ...(options.testPathPatterns ? ['--testPathPatterns', options.testPathPatterns] : []),
      ...(options.testNamePattern ? ['--testNamePattern', options.testNamePattern] : []),
      ...(options.maxWorkers ? ['--maxWorkers', `${options.maxWorkers}`] : []),
      ...(options.u || options.updateSnapshot ? ['--updateSnapshot'] : []),
      // Only include the positional args if `options._` wasn't specified
      // (to avoid possibly including them twice)
      ...(options._ || positional).map(String),
    ].filter(arg => !!arg);

    logNodeCommand(args);

    return spawn(process.execPath, args, { stdio: 'inherit', env: options.env });
  };
}
