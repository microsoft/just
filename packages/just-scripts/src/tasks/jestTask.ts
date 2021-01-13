import { resolve, logger, resolveCwd, TaskFunction, argv } from 'just-task';
import { spawn, encodeArgs } from 'just-scripts-utils';
import { existsSync } from 'fs';
import * as supportsColor from 'supports-color';

export interface JestTaskOptions {
  config?: string;
  runInBand?: boolean;
  coverage?: boolean;
  updateSnapshot?: boolean;
  watch?: boolean;
  colors?: boolean;
  passWithNoTests?: boolean;
  clearCache?: boolean;
  testPathPattern?: string;
  testNamePattern?: string;
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

  return function jest() {
    const jestCmd = resolve('jest/bin/jest.js');
    const configFile = options.config || jestConfigFile;

    if (configFile && jestCmd && existsSync(configFile)) {
      logger.info(`Running Jest`);
      const cmd = process.execPath;

      const positional = argv()._.slice(1);

      const args = [
        ...(options.nodeArgs || []),
        jestCmd,
        '--config',
        configFile,
        ...(options.passWithNoTests ? ['--passWithNoTests'] : []),
        ...(options.clearCache ? ['--clearCache'] : []),
        ...(options.colors !== false && supportsColor.stdout ? ['--colors'] : []),
        ...(options.runInBand ? ['--runInBand'] : []),
        ...(options.coverage ? ['--coverage'] : []),
        ...(options.watch ? ['--watch'] : []),
        ...(options.testPathPattern ? ['--testPathPattern', options.testPathPattern] : []),
        ...(options.testNamePattern ? ['--testNamePattern', options.testNamePattern] : []),
        ...(options.u || options.updateSnapshot ? ['--updateSnapshot'] : ['']),
        ...(options._ || []).concat(positional),
      ].filter(arg => !!arg) as Array<string>;

      logger.info(cmd, encodeArgs(args).join(' '));

      return spawn(cmd, args, { stdio: 'inherit', env: options.env });
    } else {
      logger.warn('no jest configuration found, skipping jest');
      return Promise.resolve();
    }
  };
}
