import { resolve, logger, resolveCwd } from 'just-task';
import { exec } from './exec';

export interface IJestTaskOptions {
  config?: string;
  runInBand?: boolean;
  coverage?: boolean;
  updateSnapshot?: boolean;
  u?: boolean;
  _?: string[];
}

export function jestTask(options: IJestTaskOptions = {}) {
  const jestConfigFile = resolveCwd('./jest.config.js');

  return function jest() {
    logger.info(`Running Jest`);
    const jestCmd = resolve('jest/bin/jest.js');
    const configFile = options.config || jestConfigFile;

    const args = [
      `--config ${configFile}`,
      '--passWithNoTests',
      '--colors',
      options.runInBand ? '--runInBand' : undefined,
      options.coverage ? '--coverage' : undefined,
      options.u || options.updateSnapshot ? '--updateSnapshot' : undefined,
      ...(options._ ? options._ : [])
    ]
      .filter(arg => !!arg)
      .join(' ');

    const cmd = [process.execPath, jestCmd, args].join(' ');
    logger.info(cmd);
    return exec(cmd, { stdout: process.stdout, stderr: process.stderr });
  };
}
