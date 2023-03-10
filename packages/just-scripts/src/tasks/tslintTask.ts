import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { exec, encodeArgs } from '../utils';
import * as path from 'path';
import * as fs from 'fs';

export interface TsLintTaskOptions {
  config?: string;
  project?: string;
  fix?: boolean;
}

export function tslintTask(options: TsLintTaskOptions = {}): TaskFunction {
  const projectFile = options.project || resolveCwd('./tsconfig.json');

  return function tslint() {
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

      const cmd = encodeArgs([process.execPath, tslintCmd, ...args]).join(' ');
      logger.info(cmd);
      return exec(cmd, { stdout: process.stdout, stderr: process.stderr });
    } else {
      return Promise.resolve();
    }
  };
}
