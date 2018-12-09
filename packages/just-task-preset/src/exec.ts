import { exec as cpExec, ExecOptions } from 'child_process';
import { spawn as cpSpawn, SpawnOptions } from 'child_process';

export function exec(cmd: string, opts: ExecOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {}) {
  return new Promise((resolve, reject) => {
    const child = cpExec(cmd, opts, (error, stdout, stderr) => (error ? reject(stderr) : resolve(stdout)));

    if (opts.stdout) {
      child.stdout.pipe(opts.stdout);
    }
    if (opts.stderr) {
      child.stderr.pipe(opts.stderr);
    }
  });
}

export function spawn(
  cmd: string,
  args: ReadonlyArray<string> = [],
  opts: SpawnOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {}
) {
  return new Promise((resolve, reject) => {
    const child = cpSpawn(cmd, args, opts);
    child.on('exit', code => (code !== 0 ? reject(code) : resolve()));

    if (opts.stdout) {
      child.stdout.pipe(opts.stdout);
    }
    if (opts.stderr) {
      child.stderr.pipe(opts.stderr);
    }
  });
}
