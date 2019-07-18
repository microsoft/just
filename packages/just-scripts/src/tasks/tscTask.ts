import ts from 'typescript';
import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { exec, encodeArgs, spawn } from 'just-scripts-utils';
import fs from 'fs';

export type TscTaskOptions = { [key in keyof ts.CompilerOptions]?: string | boolean };

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

      const args = Object.keys(options).reduce(
        (args, option) => {
          if (typeof options[option] === 'string') {
            return args.concat(['--' + option, options[option] as string]);
          } else if (typeof options[option] === 'boolean') {
            return args.concat(['--' + option]);
          }

          return args;
        },
        [tscCmd]
      );

      const cmd = encodeArgs([process.execPath, ...args]).join(' ');
      logger.info(`Executing: ${cmd}`);
      return exec(cmd);
    }
    return Promise.resolve();
  };
}

export function tscWatchTask(options: TscTaskOptions = {}): TaskFunction {
  const tscCmd = resolve('typescript/lib/tsc.js');

  if (!tscCmd) {
    throw new Error('cannot find tsc');
  }

  options = { ...options, ...getProjectOrBuildOptions(options) };

  return function tscWatch() {
    if (isValidProject(options)) {
      logger.info(`Running ${tscCmd} with ${options.project || options.build} in watch mode`);

      const args = Object.keys(options).reduce(
        (args, option) => {
          if (typeof options[option] === 'string') {
            return args.concat(['--' + option, options[option] as string]);
          } else if (typeof options[option] === 'boolean') {
            return args.concat(['--' + option]);
          }

          return args;
        },
        [tscCmd]
      );

      const cmd = [...args, '--watch'];
      logger.info(encodeArgs(cmd).join(' '));
      return spawn(process.execPath, cmd, { stdio: 'inherit' });
    }
    return Promise.resolve();
  };
}

function getProjectOrBuildOptions(options: TscTaskOptions) {
  const tsConfigFile = resolveCwd('./tsconfig.json') || 'tsconfig.json';
  const result: { [option: string]: string | boolean } = {};

  if (options.project) {
    result.project = options && typeof options.project === 'string' ? options.project : tsConfigFile;
  } else if (options.build) {
    result.build = options && typeof options.build === 'string' ? options.build : tsConfigFile;
  } else if (tsConfigFile) {
    result.project = tsConfigFile;
  }

  return result;
}

function isValidProject(options: TscTaskOptions) {
  return (options.project && fs.existsSync(options.project as string)) || (options.build && fs.existsSync(options.build as string));
}
