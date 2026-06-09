import { logger, type TaskFunction } from 'just-task';
import { logNodeCommand, spawn } from '../utils';
import { splitArrayIntoChunks } from '../arrayUtils/splitArrayIntoChunks';
import { arrayify } from '../arrayUtils/arrayify';
import { resolveWrapper } from '../tryRequire';

interface PrettierContext {
  prettierBin: string;
  configPath?: string;
  ignorePath?: string;
  /**
   * Files to format (globs are supported and passed directly to prettier).
   * Will split into chunks of 20.
   *
   * Default is `${cwd}/** /*.{ts,tsx,js,jsx,json,scss,html,yml,md}` but it's better to just
   * specify `['.']` and properly set up `.prettierignore` and pass it as `ignorePath`.
   * Note that prettier v3 respects `.gitignore` by default.
   */
  files: string[];
  check: boolean;
}

export interface PrettierTaskOptions {
  files?: string[] | string;
  ignorePath?: string;
  configPath?: string;
  check?: boolean;
}

/**
 * Create a task to run prettier via its CLI. Logs a warning if `prettier` is not found.
 */
export function prettierTask(options: PrettierTaskOptions = {}): TaskFunction {
  // check v2 or v3 path
  const prettierBin = resolveWrapper('prettier/bin-prettier.js') || resolveWrapper('prettier/bin/prettier.cjs');

  if (prettierBin) {
    return function prettier() {
      return runPrettierAsync({
        prettierBin,
        ...{ configPath: options.configPath || undefined },
        ...{ ignorePath: options.ignorePath || undefined },
        ...{
          files: arrayify(
            options.files || `${process.cwd().replace(/\\/g, '/')}/**/*.{ts,tsx,js,jsx,json,scss,html,yml,md}`,
          ),
        },
        check: !!options.check,
      });
    };
  }

  // undertaker apparently requires returning a promise, async function, or function that calls done()
  // eslint-disable-next-line @typescript-eslint/require-await
  return async () => {
    logger.warn('prettier not found, so this task has no effect.');
  };
}

export function prettierCheckTask(options: PrettierTaskOptions = {}): TaskFunction {
  return prettierTask({ ...options, check: true });
}

const MaxFileEntriesPerChunk = 20;

async function runPrettierAsync(context: PrettierContext) {
  const { prettierBin, configPath, ignorePath, files, check } = context;

  const chunks = splitArrayIntoChunks(files, MaxFileEntriesPerChunk);

  for (const chunk of chunks) {
    const prettierArgs = [
      prettierBin,
      ...(configPath ? ['--config', configPath] : []),
      ...(ignorePath ? ['--ignore-path', ignorePath] : []),
      ...(check ? ['--check'] : ['--write']),
      ...chunk,
    ];

    logNodeCommand(prettierArgs);

    await spawn(process.execPath, prettierArgs, { stdio: 'inherit' });
  }
}
