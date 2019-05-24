import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { exec, encodeArgs } from 'just-scripts-utils';
import path from 'path';
import fs from 'fs';

export interface TsLintTaskOptions {
  config?: string;
  fix?: boolean;
}

export function tslintTask(options: TsLintTaskOptions = {}): TaskFunction {
  const projectFile = resolveCwd('./tsconfig.json');

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
        path.dirname(resolve('tslint-microsoft-contrib') || '')
      ];

      if (options.fix === true) {
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
