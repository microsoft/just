import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { spawn, encodeArgs } from './exec';
import { existsSync } from 'fs';

export interface JestTaskOptions {
  config?: string;
  runInBand?: boolean;
  coverage?: boolean;
  updateSnapshot?: boolean;
  watch?: boolean;
  u?: boolean;
  _?: string[];
}

export function jestTask(options: JestTaskOptions = {}): TaskFunction {
  const jestConfigFile = resolveCwd('./jest.config.js');

  return function jest() {
    const jestCmd = resolve('jest/bin/jest.js');
    const configFile = options.config || jestConfigFile;

    if (configFile && jestCmd && existsSync(configFile)) {
      logger.info(`Running Jest`);
      const cmd = process.execPath;

      const args = [
        jestCmd,
        '--config',
        configFile,
        '--passWithNoTests',
        '--colors',
        options.runInBand ? '--runInBand' : '',
        options.coverage ? '--coverage' : '',
        options.watch ? '--watch' : '',
        options.u || options.updateSnapshot ? '--updateSnapshot' : '',
        ...(options._ ? options._ : [])
      ].filter(arg => !!arg) as Array<string>;

      logger.info(cmd, encodeArgs(args).join(' '));

      return spawn(cmd, args, { stdio: 'inherit' });
    } else {
      logger.warn('no jest configuration found, skipping jest');
      return Promise.resolve();
    }
  };
}
