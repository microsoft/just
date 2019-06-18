import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { encodeArgs, spawn } from 'just-scripts-utils';
import fs from 'fs';

export interface EsLintTaskOptions {
  files?: string[];
  configPath?: string;
  ignorePath?: string;
  fix?: boolean;
  maxWarnings?: number;
}

export function eslintTask(options: EsLintTaskOptions = {}): TaskFunction {
  return function eslint() {
    const eslintCmd = resolve('eslint/bin/eslint.js');
    const eslintConfigPath = (options && options.configPath) || resolveCwd('.eslintrc');
    if (eslintCmd && eslintConfigPath && fs.existsSync(eslintConfigPath)) {
      const eslintIgnorePath = (options && options.ignorePath) || resolveCwd('.eslintignore');

      const eslintArgs = [
        eslintCmd,
        ...(options && options.files ? options.files : ['.']),
        ...(eslintConfigPath ? ['--config', eslintConfigPath, '--no-eslintrc'] : []),
        ...(eslintIgnorePath ? ['--ignore-path', eslintIgnorePath] : []),
        ...(options && options.fix ? ['--fix'] : []),
        ...(options && options.maxWarnings ? ['--max-warnings', `${options.maxWarnings}`] : []),
        '--color'
      ];

      logger.info(encodeArgs(eslintArgs).join(' '));
      return spawn(process.execPath, eslintArgs, { stdio: 'inherit' });
    } else {
      return Promise.resolve();
    }
  };
}
