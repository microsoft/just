import * as cp from 'child_process';
import { resolve } from 'path';

export interface ExecError extends cp.ExecException {
  stdout?: string;
  stderr?: string;
}

const SEPARATOR = process.platform === 'win32' ? ';' : ':';

/**
 * Execute a command.
 *
 * @param cmd Command to execute
 * @param opts Normal exec options plus stdout/stderr for piping output. Can pass `process` for this param.
 * @returns Promise which will settle when the command completes. If output was not piped, it will be
 * returned as the promise's value. If the promise was rejected, the error will be of type `ExecError`.
 */
export function exec(
  cmd: string,
  opts: cp.ExecOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {},
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const child = cp.exec(cmd, opts, (error: ExecError | null, stdout?: string, stderr?: string) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      } else {
        resolve(stdout);
      }
    });

    if (opts.stdout) {
      child.stdout?.pipe(opts.stdout);
    }

    if (opts.stderr) {
      child.stderr?.pipe(opts.stderr);
    }
  });
}

/**
 * Encode args for a shell command.
 * @param cmdArgs Args to encode
 * @returns Encoded args
 */
export function encodeArgs(cmdArgs: string[]): string[] {
  // Taken from https://github.com/xxorax/node-shell-escape/blob/master/shell-escape.js
  // However, we needed to use double quotes because that's the norm in more platforms
  if (!cmdArgs) {
    return cmdArgs;
  }

  return cmdArgs.map(arg => {
    if (/[^\w/:=-]/.test(arg)) {
      arg = `"${arg.replace(/"/g, '"\\"')}"`;
      arg = arg.replace(/^(?:"")+/g, '').replace(/\\"""/g, '\\"');
    }

    return arg;
  });
}

/**
 * Execute a command synchronously.
 *
 * @param cmd  Command to execute
 * @param cwd Working directory in which to run the command (default: `process.cwd()`)
 * @param returnOutput If true, return the command's output. If false/unspecified,
 * inherit stdio from the parent process (so the child's output goes to the console).
 * @returns If `returnOutput` is true, returns the command's output. Otherwise returns undefined.
 */
export function execSync(cmd: string, cwd?: string, returnOutput?: boolean): string | undefined {
  cwd = cwd || process.cwd();

  const env = { ...process.env };
  env.PATH = resolve('./node_modules/.bin') + SEPARATOR + env.PATH;

  const output = cp.execSync(cmd, {
    cwd,
    env,
    stdio: returnOutput ? undefined : 'inherit',
  });
  return returnOutput ? (output || '').toString('utf8') : undefined;
}

/**
 * Execute a command in a new process.
 *
 * @param cmd Command to execute
 * @param args Args for the command
 * @param opts Normal spawn options plus stdout/stderr for piping output. Can pass `process` for this param.
 * @returns Promise which will settle when the command completes. If the promise is rejected, the error will
 * include the child process's exit code.
 */
export function spawn(
  cmd: string,
  args: ReadonlyArray<string> = [],
  opts: cp.SpawnOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(cmd, args, opts);
    child.on('exit', (code: number | null, signal: string | null) => {
      if (code) {
        const error = new Error('Command failed: ' + [cmd, ...args].join(' '));
        (error as any).code = code;
        reject(error);
      } else if (signal) {
        const error = new Error(`Command terminated by signal ${signal}: ` + [cmd, ...args].join(' '));
        (error as any).signal = signal;
        reject(error);
      } else {
        resolve();
      }
    });

    if (opts.stdout) {
      child.stdout?.pipe(opts.stdout);
    }
    if (opts.stderr) {
      child.stderr?.pipe(opts.stderr);
    }
  });
}
