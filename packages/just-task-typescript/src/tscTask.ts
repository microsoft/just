import resolve from 'resolve';
import path from 'path';
import { spawn } from 'child_process';
import * as ts from 'typescript';
import { ILogger } from 'just-task/lib/logger';

const typescriptPath = resolve.sync('typescript', { basedir: __dirname, preserveSymlinks: true });
const tscCmd = path.resolve(path.dirname(typescriptPath), 'tsc.js');

export function tscTask(options: ts.CompilerOptions) {
  return function(this: { logger: ILogger }, done: (err?: Error) => void) {
    this.logger.info(`Running ${tscCmd} with ${options.project}`);

    const args = Object.keys(options).reduce(
      (args, option) => {
        return args.concat(['--' + option, options[option] as string]);
      },
      [tscCmd]
    );

    const cp = spawn(process.execPath, args, { stdio: 'inherit' });

    cp.stdout.on('data', data => {
      this.logger.info(data.toString().trim());
    });

    cp.on('exit', code => {
      if (code !== 0) {
        return done(new Error('Error in typescript'));
      }
      done();
    });
  };
}
