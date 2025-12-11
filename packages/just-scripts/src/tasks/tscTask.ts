import * as ts from 'typescript';
import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { exec, encodeArgs, spawn } from '../utils';
import * as fs from 'fs';

export type TscTaskOptions = { [key in keyof ts.CompilerOptions]?: string | boolean | string[] } & {
  nodeArgs?: string[];
};

/**
 * Returns a task that runs the TSC CLI.
 */
export function tscTask(options: TscTaskOptions = {}): TaskFunction {
  const tscCmd = resolve('typescript/lib/tsc.js');

  if (!tscCmd) {
    throw new Error('cannot find tsc');
  }

  return function tsc() {
    // Read from options argument, if not there try the tsConfigFile found in root, if not then skip and use no config
    options = { ...options, ...getProjectOrBuildOptions(options) };

    if (isValidProject(options)) {
      logger.info(`Running ${tscCmd} with ${options.project || options.build}`);

      const args = argsFromOptions(tscCmd, options);
      const cmd = encodeArgs([process.execPath, ...args]).join(' ');
      logger.info(`Executing: ${cmd}`);
      return exec(cmd);
    }
    return Promise.resolve();
  };
}

/**
 * Returns a task that runs the TSC CLI in watch mode.
 */
export function tscWatchTask(options: TscTaskOptions = {}): TaskFunction {
  const tscCmd = resolve('typescript/lib/tsc.js');

  if (!tscCmd) {
    throw new Error('cannot find tsc');
  }

  return function tscWatch() {
    options = { ...options, ...getProjectOrBuildOptions(options) };

    if (isValidProject(options)) {
      logger.info(`Running ${tscCmd} with ${options.project || options.build} in watch mode`);

      const args = argsFromOptions(tscCmd, options);
      const cmd = [...args, '--watch'];
      logger.info(encodeArgs(cmd).join(' '));
      return spawn(process.execPath, cmd, { stdio: 'inherit' });
    }
    return Promise.resolve();
  };
}

/**
 * Determine `project` or `build` options. `build` option takes precedence.
 */
function getProjectOrBuildOptions(options: TscTaskOptions) {
  const tsConfigFile = resolveCwd('./tsconfig.json') || 'tsconfig.json';
  const result: { [option: string]: string | boolean | string[] } = {};

  if (options.build) {
    result.build = typeof options.build === 'string' || Array.isArray(options.build) ? options.build : tsConfigFile;
  } else {
    result.project = typeof options.project === 'string' ? options.project : tsConfigFile;
  }
  return result;
}

/**
 * Returns true if the `project` or `build` setting refers to an existing `tsconfig.json` file.
 */
function isValidProject(options: TscTaskOptions) {
  return (
    (typeof options.project === 'string' && fs.existsSync(options.project)) ||
    (typeof options.build === 'string' && fs.existsSync(options.build)) ||
    (Array.isArray(options.build) &&
      options.build.reduce((currentIsValid, buildPath) => {
        return currentIsValid && typeof buildPath === 'string' && fs.existsSync(buildPath);
      }, true as boolean))
  );
}

/**
 * Returns an array of CLI arguments for TSC given the `options`.
 */
function argsFromOptions(tscCmd: string, options: TscTaskOptions): string[] {
  const { nodeArgs, ...rest } = options;

  return [
    ...(nodeArgs ? nodeArgs : []),
    ...Object.keys(rest).reduce(
      (currentArgs, option) => {
        const optionValue = options[option];
        if (typeof optionValue === 'string') {
          return currentArgs.concat(['--' + option, optionValue]);
        } else if (typeof optionValue === 'boolean' && optionValue) {
          return currentArgs.concat(['--' + option]);
        } else if (Array.isArray(optionValue)) {
          return currentArgs.concat(['--' + option, ...optionValue]);
        }
        return currentArgs;
      },
      [tscCmd],
    ),
  ];
}
