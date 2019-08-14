import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { encodeArgs, spawn } from 'just-scripts-utils';
import fs from 'fs';

export interface EsLintTaskOptions {
  files?: string[];
  configPath?: string;
  ignorePath?: string;
  resolvePluginsPath?: string;
  fix?: boolean;
  extensions?: string;
  noEslintRc?: boolean;
  maxWarnings?: number;
}

export function eslintTask(options: EsLintTaskOptions = {}): TaskFunction {
  return function eslint() {
    const { files, configPath, ignorePath, fix, extensions, noEslintRc, maxWarnings, resolvePluginsPath } = options;
    const eslintCmd = resolve('eslint/bin/eslint.js');
    const eslintConfigPath = configPath || resolveCwd('.eslintrc');
    if (eslintCmd && eslintConfigPath && fs.existsSync(eslintConfigPath)) {
      const eslintIgnorePath = ignorePath || resolveCwd('.eslintignore');

      const eslintArgs = [
        eslintCmd,
        ...(files ? files : ['.']),
        ...['--ext', extensions ? extensions : '.js,.jsx,.ts,.tsx'],
        ...(noEslintRc ? '--no-eslintrc' : []),
        ...(eslintConfigPath ? ['--config', eslintConfigPath] : []),
        ...(eslintIgnorePath ? ['--ignore-path', eslintIgnorePath] : []),
        ...(resolvePluginsPath ? ['--resolve-plugins-relative-to', resolvePluginsPath] : []),
        ...(fix ? ['--fix'] : []),
        ...(maxWarnings !== undefined ? ['--max-warnings', `${maxWarnings}`] : []),
        '--color'
      ];

      logger.info(encodeArgs(eslintArgs).join(' '));
      return spawn(process.execPath, eslintArgs, { stdio: 'inherit' });
    } else {
      return Promise.resolve();
    }
  };
}
