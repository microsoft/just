import execa from 'execa';
import { logger } from 'just-task';

/**
 * Execute a command in a new process. Uses `execa` to avoid issues with quoting/escaping.
 * Logs the command before executing and sets `stdio: 'inherit'` by default.
 *
 * @param program Node file to execute
 * @param args Args for the command. Quoting/escaping is handled internally by `execa`.
 * @param opts Options for `execa`. `stdio: 'inherit'` is set by default but can be overridden.
 * Note that `execa` sets `extendEnv: true` by default, so `env` doesn't override `process.env`.
 *
 * @returns Promise which will settle when the command completes. Rejections will be `ExecaError`.
 */
export function execNode(
  program: string,
  args: ReadonlyArray<string> = [],
  opts: Omit<execa.NodeOptions, 'shell'> = {},
): Promise<execa.ExecaReturnValue> {
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

  return execa.node(program, args, { stdio: 'inherit', ...opts });
}
