import { exec as cpExec, ExecOptions } from 'child_process';
import { spawn as cpSpawn, SpawnOptions } from 'child_process';

export function exec(cmd: string, opts: ExecOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {}) {
  return new Promise((resolve, reject) => {
    const child = cpExec(cmd, opts, (error, stdout, stderr) => (error ? reject(stderr || stdout) : resolve(stdout)));

    if (opts.stdout) {
      child.stdout.pipe(opts.stdout);
    }

    if (opts.stderr) {
      child.stderr.pipe(opts.stderr);
    }
  });
}

// Taken from https://github.com/xxorax/node-shell-escape/blob/master/shell-escape.js
// However, we needed to use double quotes because that's the norm in more platforms
export function encodeArgs(cmdArgs: string[]) {
  return cmdArgs.map(arg => {
    if (/[^A-Za-z0-9_\/:=-]/.test(arg)) {
      arg = '"' + arg.replace(/"/g, '"\\"') + '"';
      arg = arg.replace(/^(?:"")+/g, '').replace(/\\"""/g, '\\"');
    }

    return arg;
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
