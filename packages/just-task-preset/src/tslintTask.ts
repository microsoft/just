import { resolve, logger, resolveCwd } from 'just-task';
import { exec } from './exec';
import path from 'path';

export interface ITsLintTaskOptions {
  config?: string;
}

export function tslintTask(options: ITsLintTaskOptions = {}) {
  const projectFile = resolveCwd('./tsconfig.json');

  return function tslint() {
    logger.info(`Running tslint`);
    const tslintCmd = resolve('tslint/lib/tslintCli.js');

    const args = ['--project', projectFile, '-t', 'stylish', '-r', path.dirname(resolve('tslint-microsoft-contrib') || '')];

    const cmd = [process.execPath, tslintCmd, ...args].join(' ');
    logger.info(cmd);
    return exec(cmd, { stdout: process.stdout, stderr: process.stderr });
  };
}
