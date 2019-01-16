import * as ts from 'typescript';
import { resolve, logger, resolveCwd } from 'just-task';
import { exec, encodeArgs } from './exec';
import path from 'path';
import fs from 'fs';

type CompilerOptions = { [key in keyof ts.CompilerOptions]: string | boolean };

export function tscTask(options: CompilerOptions) {
  const tsConfigFile = resolveCwd('./tsconfig.json');
  const tscCmd = resolve('typescript/lib/tsc.js');

  if (!tscCmd) {
    throw new Error('cannot find tsc');
  }

  return function tsc() {
    options.project = options.project || tsConfigFile || undefined;

    if (options.project && fs.existsSync(options.project as string)) {
      logger.info(`Running ${tscCmd} with ${options.project}`);

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
    } else {
      Promise.resolve();
    }
  };
}
