import type { TaskFunction } from 'just-task';
import { resolve, logger, resolveCwd } from 'just-task';
import path from 'path';
import fs from 'fs';
import { logNodeCommand, spawn } from '../utils';

export interface TsLintTaskOptions {
  config?: string;
  project?: string;
  fix?: boolean;
}

export function tslintTask(options: TsLintTaskOptions = {}): TaskFunction {
  const projectFile = options.project || resolveCwd('./tsconfig.json');

  return async function tslint() {
    const tslintCmd = resolve('tslint/lib/tslintCli.js');

    if (projectFile && tslintCmd && fs.existsSync(projectFile)) {
      logger.info(`Running tslint`);

      const args = [
        '--project',
        projectFile,
        '-t',
        'stylish',
        '-r',
        path.dirname(resolve('tslint-microsoft-contrib') || ''),
      ];

      if (options.fix) {
        args.push('--fix');
      }

      const allArgs = [tslintCmd, ...args];
      logNodeCommand(allArgs);
      return spawn(process.execPath, allArgs, { stdio: 'inherit' });
    }

    // undertaker apparently requires returning a promise, async function, or function that calls done()
    return Promise.resolve();
  };
}
