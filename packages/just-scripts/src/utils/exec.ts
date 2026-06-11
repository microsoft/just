import { logger } from 'just-task';
import type { Options as SpawnOptions, Subprocess } from 'nano-spawn';

/**
 * Execute a command in a new process using `nano-spawn`.
 * Logs the command before executing and sets `stdio: 'inherit'` by default.
 *
 * @param program Node file to execute
 * @param args Args for the command.
 * @param opts Options for `nano-spawn`. `stdio: 'inherit'` is set by default but can be overridden.
 * Note that `env` extends `process.env` rather than overriding.
 *
 * @returns Promise which will settle when the command completes.
 * Rejections will be `nano-spawn`'s `SubprocessError`.
 */
export async function spawnNode(
  program: string,
  args: ReadonlyArray<string> = [],
  opts: Omit<SpawnOptions, 'shell'> & {
    /** Additional args to pass to Node.js */
    nodeArgs?: string[];
  } = {},
): Promise<Subprocess> {
  // nano-spawn is ESM and must be async imported from CJS
  const nanoSpawn = (await import('nano-spawn')).default;

  const { nodeArgs = [], ...spawnOpts } = opts;

  const flatArgs = args.flat().map(arg => {
    // Based on https://github.com/xxorax/node-shell-escape/blob/master/shell-escape.js
    // but note this is NOT a complete safe quoting implementation (just for logging)
    if (/[^\w/:=-]/.test(arg)) {
      arg = `"${arg.replace(/"/g, '"\\"')}"`;
      arg = arg.replace(/^(?:"")+/g, '').replace(/\\"""/g, '\\"');
    }
    return arg;
  });

  logger.info(`Running: ${process.execPath}${nodeArgs.length ? ' ' + nodeArgs.join(' ') : ''} ${flatArgs.join(' ')}`);

  // nano-spawn provides the nice termination handling that was previously implemented manually
  return nanoSpawn(process.execPath, [...nodeArgs, program, ...args], { stdio: 'inherit', ...spawnOpts });
}
