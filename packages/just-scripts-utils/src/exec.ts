import cp from 'child_process';

/**
 * Execute a command.
 *
 * @param cmd Command to execute
 * @param opts Normal exec options plus stdout/stderr for piping output. Can pass `process` for this param.
 * @returns Promise which will settle when the command completes. If output was not piped, it will be
 * returned as the promise's value.
 */
export function exec(
  cmd: string,
  opts: cp.ExecOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {}
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const child = cp.exec(
      cmd,
      opts,
      (error: cp.ExecException | null, stdout?: string, stderr?: string) => {
        if (error) {
          reject(stderr || stdout);
        } else {
          resolve(stdout);
        }
      }
    );

    if (opts.stdout) {
      child.stdout.pipe(opts.stdout);
    }

    if (opts.stderr) {
      child.stderr.pipe(opts.stderr);
    }
  });
}

/**
 * Encode args for a shell command.
 * @param cmdArgs Args to encode
 * @returns Encoded args
 */
export function encodeArgs(cmdArgs: string[]) {
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
 * Execute a command in a new process.
 *
 * @param cmd Command to execute
 * @param args Args for the command
 * @param opts Normal spawn options plus stdout/stderr for piping output. Can pass `process` for this param.
 * @returns Promise which will settle when the command completes. If the promise is rejected, the error code
 * will be the rejection value.
 */
export function spawn(
  cmd: string,
  args: ReadonlyArray<string> = [],
  opts: cp.SpawnOptions & { stdout?: NodeJS.WritableStream; stderr?: NodeJS.WritableStream } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(cmd, args, opts);
    child.on('exit', code => (code !== 0 ? reject(code) : resolve()));

    if (opts.stdout) {
      child.stdout.pipe(opts.stdout);
    }
    if (opts.stderr) {
      child.stderr.pipe(opts.stderr);
    }
  });
}
