import type cp from 'child_process';
import { spawn as crossSpawn } from 'cross-spawn';
import { logger } from 'just-task';

// `exec` and `execSync` were removed due to security issues (keeping filename for history)

/**
 * Log `Running: <process.execPath> <...args>`
 */
export function logNodeCommand(...args: (string | string[])[]): void {
  const flatArgs = args.flat().map(arg => {
    // Based on https://github.com/xxorax/node-shell-escape/blob/master/shell-escape.js
    // but note this is NOT a complete safe quoting implementation (just for logging)
    if (/[^\w/:=-]/.test(arg)) {
      arg = `"${arg.replace(/"/g, '"\\"')}"`;
      arg = arg.replace(/^(?:"")+/g, '').replace(/\\"""/g, '\\"');
    }
    return arg;
  });

  logger.info(`Running: ${process.execPath} ${flatArgs.join(' ')}`);
}

/**
 * Execute a command in a new process. Uses `cross-spawn` to avoid issues with spaces in arguments,
 * but does not do any additional escaping.
 *
 * @param cmd Command to execute
 * @param args Args for the command. Quoting spaces is handled internally by `cross-spawn`.
 * @param opts Normal spawn options plus stdout/stderr for piping output. (To inherit stdio from the
 * parent process, just use `stdio: 'inherit'` instead.)
 *
 * @returns Promise which will settle when the command completes. If the promise is rejected, the error will
 * include the child process's exit code (`error.code`) or signal (`error.signal`) if relevant.
 * The returned promise also has a `child` property with the spawned `ChildProcess` instance.
 *
 * @deprecated This function is not recommended for use outside the `just-scripts` package.
 * Instead, consider a more mature, purpose-specific library such as `execa` or `nano-spawn`.
 */
export function spawn(
  cmd: string,
  args: ReadonlyArray<string> = [],
  opts: Omit<cp.SpawnOptions, 'shell'> & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    let child: cp.ChildProcess;
    try {
      child = crossSpawn(cmd, args, opts);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      reject(error);
      return;
    }

    const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
      child.off('error', onError);
      if (code) {
        const error = new Error('Command failed: ' + [cmd, ...args].join(' '));
        (error as Error & { code: number }).code = code;
        reject(error);
      } else if (signal) {
        const error = new Error(`Command terminated by signal ${signal}: ` + [cmd, ...args].join(' '));
        (error as Error & { signal: NodeJS.Signals }).signal = signal;
        reject(error);
      } else {
        resolve();
      }
    };

    // Some error circumstances may fire 'error' rather than 'exit'
    // https://nodejs.org/docs/latest/api/child_process.html#event-error
    const onError = (error: Error): void => {
      reject(error);
      child.off('exit', onExit);
    };

    child.on('exit', onExit);
    child.on('error', onError);

    if (opts.stdout) {
      child.stdout?.pipe(opts.stdout);
    }
    if (opts.stderr) {
      child.stderr?.pipe(opts.stderr);
    }
  });
}
