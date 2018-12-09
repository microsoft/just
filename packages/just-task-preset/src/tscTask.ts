import path from 'path';
import { spawn } from 'child_process';
import * as ts from 'typescript';
import { resolve, logger } from 'just-task';
import { exec } from './exec';

type CompilerOptions = { [key in keyof ts.CompilerOptions]: string | boolean };

export function tscTask(options: CompilerOptions) {
  const tscCmd = resolve('typescript/lib/tsc.js');

  if (!tscCmd) {
    throw new Error('cannot find tsc');
  }

  return function tsc() {
    if (options.project) {
      logger.info(`Running ${tscCmd} with ${options.project}`);
    } else {
      logger.info(`Running ${tscCmd}`);
    }

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

    const cmd = [process.execPath, ...args].join(' ');
    logger.info(cmd);
    return exec(cmd);
  };
}
