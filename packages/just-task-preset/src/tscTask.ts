import path from 'path';
import { spawn } from 'child_process';
import * as ts from 'typescript';
import { resolve, logger } from 'just-task';

type CompilerOptions = { [key in keyof ts.CompilerOptions]: string | boolean };

export function tscTask(options: CompilerOptions) {
  const typescriptPath = resolve('typescript');

  if (!typescriptPath) {
    throw new Error('cannot find tsc');
  }

  const tscCmd = path.resolve(path.dirname(typescriptPath!), 'tsc.js');

  return function tsc(done: (err?: Error) => void) {
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

    const cp = spawn(process.execPath, args, { stdio: 'pipe' });

    cp.stdout.on('data', data => {
      logger.info(data.toString().trim());
    });

    cp.stderr.on('error', data => {
      logger.error(data.toString().trim());
    });

    cp.on('exit', code => {
      if (code !== 0) {
        return done(new Error('Error in typescript'));
      }
      done();
    });
  };
}
