import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { encodeArgs, spawn } from 'just-scripts-utils';
import * as fs from 'fs';

/**
 * Task options generally follow ESLint CLI options explained here:
 * https://eslint.org/docs/user-guide/command-line-interface
 */
export interface EsLintTaskOptions {
  files?: string[];
  configPath?: string;
  ignorePath?: string;
  resolvePluginsPath?: string;
  fix?: boolean;
  extensions?: string;
  noEslintRc?: boolean;
  maxWarnings?: number;
  cache?: boolean;
  cacheLocation?: string;
  /**
   * Upon lint completion, display a table of the 10 slowest rules
   * (see https://eslint.org/docs/developer-guide/working-with-rules-deprecated#per-rule-performance).
   */
  timing?: boolean;
  /** Can be set to write the eslint report to a file */
  outputFile?: string;
  /** Can be set to dictate the format of use for report file generated with the output flag: https://eslint.org/docs/latest/user-guide/command-line-interface#-f---format */
  format?: string;
}

export function eslintTask(options: EsLintTaskOptions = {}): TaskFunction {
  return function eslint() {
    const {
      files,
      configPath,
      ignorePath,
      fix,
      extensions,
      noEslintRc,
      maxWarnings,
      resolvePluginsPath,
      cache,
      cacheLocation,
      timing,
      outputFile,
      format,
    } = options;
    const eslintCmd = resolve('eslint/bin/eslint.js');
    // Try all possible extensions in the order listed here: https://eslint.org/docs/user-guide/configuring#configuration-file-formats
    const eslintConfigPath = configPath || resolveCwd('.eslintrc', { extensions: ['.js', '.cjs', '.yaml', '.yml', '.json'] });

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
        ...(cache ? ['--cache'] : []),
        ...(cacheLocation ? ['--cache-location', cacheLocation] : []),
        ...(outputFile ? ['--output-file', outputFile] : []),
        ...(format ? ['--format', format] : []),
        '--color',
      ];

      logger.info(encodeArgs(eslintArgs).join(' '));
      return spawn(process.execPath, eslintArgs, { stdio: 'inherit', ...(timing && { env: { TIMING: '1' } }) });
    } else {
      return Promise.resolve();
    }
  };
}
