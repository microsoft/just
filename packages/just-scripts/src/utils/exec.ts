import * as cp from 'child_process';
import { spawn as crossSpawn } from 'cross-spawn';
import { logger } from 'just-task';

// `exec` and `execSync` were removed due to security issues (keeping filename for history)

/**
 * @deprecated This prevents issues from spaces in args, but does NOT escape shell metacharacters.
 * For full escaping, consider a library such as `shell-quote` instead. (Note that `spawn` and tasks
 * from this package now use `cross-spawn` which escapes spaces internally.)
 */
export function encodeArgs(cmdArgs: string[]): string[] {
  return quoteSpaces(cmdArgs);
}

/**
 * Quote arguments containing spaces. Note that this does NOT do any other escaping!
 * For more complete escaping, consider a library such as `shell-quote`, or use safer APIs which
 * don't require escaping. (Note that `spawn` from this package now uses `cross-spawn` which
 * escapes spaces internally.)
 */
function quoteSpaces(cmdArgs: string[]): string[] {
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
 * Log `Running: <process.execPath> <...args>`
 */
export function logNodeCommand(...args: (string | string[])[]): void {
  logger.info(`Running: ${process.execPath} ${quoteSpaces(args.flat()).join(' ')}`);
}

/**
 * Execute a command in a new process. Uses `cross-spawn` to avoid issues with spaces in arguments,
 * but does not do any additional escaping. (For further enhancements, consider using the `execa`
 * library instead.)
 *
 * **WARNING: If the `shell` option is enabled, do not pass unsanitized user input to this function.
 * Any input containing shell metacharacters may be used to trigger arbitrary command execution.**
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
  opts: cp.SpawnOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    let child: cp.ChildProcess;
    try {
      child = crossSpawn(cmd, args, opts);
    } catch (error) {
      reject(error);
      return;
    }

    const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
      child.off('error', onError);
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
