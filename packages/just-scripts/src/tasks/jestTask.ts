import { resolve, logger, resolveCwd, TaskFunction, argv } from 'just-task';
import { spawn, encodeArgs, readPackageJson } from '../utils';
import { existsSync } from 'fs';
import * as supportsColor from 'supports-color';

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
  testPathPattern?: string;
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

export function jestTask(options: JestTaskOptions = {}): TaskFunction {
  const jestConfigFile = resolveCwd('./jest.config.js');
  const packageConfigPath = process.cwd();

  return function jest() {
    const jestCmd = resolve('jest/bin/jest.js');
    const configFile = options.config || jestConfigFile;
    const configFileExists = configFile && existsSync(configFile);

    let packageConfigExists = false;
    if (configFileExists) {
      logger.verbose(`Using jest config file ${configFile}`);
    } else {
      const packageConfig = readPackageJson(packageConfigPath);
      if (packageConfig && packageConfig.jest) {
        packageConfigExists = true;
        logger.verbose(`Using jest config from package.json`);
      }
    }

    if ((configFileExists || packageConfigExists) && jestCmd) {
      logger.info(`Running Jest`);
      const cmd = process.execPath;

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
        ...(options.testNamePattern ? ['--testNamePattern', options.testNamePattern] : []),
        ...(options.maxWorkers ? ['--maxWorkers', options.maxWorkers] : []),
        ...(options.u || options.updateSnapshot ? ['--updateSnapshot'] : ['']),
        // Only include the positional args if `options._` wasn't specified
        // (to avoid possibly including them twice)
        ...(options._ || positional),
      ].filter(arg => !!arg) as string[];

      logger.info(cmd, encodeArgs(args).join(' '));

      return spawn(cmd, args, { stdio: 'inherit', env: options.env });
    } else {
      logger.warn('no jest configuration found, skipping jest');
      return Promise.resolve();
    }
  };
}
