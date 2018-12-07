import resolve from 'resolve';
import path from 'path';
import { spawn } from 'child_process';
import * as ts from 'typescript';
import { ILogger } from 'just-task/lib/logger';

const typescriptPath = resolve.sync('typescript', { basedir: __dirname, preserveSymlinks: true });
const tscCmd = path.resolve(path.dirname(typescriptPath), 'tsc.js');

interface Arguments {
  [key: string]: string;
}

type GetOptions = ts.CompilerOptions | ((test: Arguments) => ts.CompilerOptions);

export function tscTask(getOptions: GetOptions) {
  return function tsc(this: { logger: ILogger; argv: Arguments }, done: (err?: Error) => void) {
    const options = (typeof getOptions === 'function' ? getOptions(this.argv) : getOptions) || {};

    if (options.project) {
      this.logger.info(`Running ${tscCmd} with ${options.project}`);
    } else {
      this.logger.info(`Running ${tscCmd}`);
    }

    const args = Object.keys(options).reduce(
      (args, option) => {
        return args.concat(['--' + option, options[option] as string]);
      },
      [tscCmd]
    );

    const cp = spawn(process.execPath, args, { stdio: 'pipe' });

    cp.stdout.on('data', data => {
      this.logger.info(data.toString().trim());
    });

    cp.stderr.on('error', data => {
      this.logger.error(data.toString().trim());
    });

    cp.on('exit', code => {
      if (code !== 0) {
        return done(new Error('Error in typescript'));
      }
      done();
    });
  };
}
