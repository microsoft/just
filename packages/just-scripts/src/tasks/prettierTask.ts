import { logger, resolve, TaskFunction } from 'just-task';
import { spawn } from '../utils';
import { splitArrayIntoChunks } from '../arrayUtils/splitArrayIntoChunks';
import * as path from 'path';
import { arrayify } from '../arrayUtils/arrayify';

interface PrettierContext {
  prettierBin: string;
  configPath?: string;
  ignorePath?: string;
  files: string[];
  check: boolean;
}

export interface PrettierTaskOptions {
  files?: string[] | string;
  ignorePath?: string;
  configPath?: string;
}

export function prettierTask(options: PrettierTaskOptions = {}): TaskFunction {
  const prettierBin = resolve('prettier/bin-prettier.js');

  if (prettierBin) {
    return function prettier() {
      return runPrettierAsync({
        prettierBin,
        ...{ configPath: options.configPath || undefined },
        ...{ ignorePath: options.ignorePath || undefined },
        ...{
          files: arrayify(
            options.files || path.resolve(process.cwd(), '**', '*.{ts,tsx,js,jsx,json,scss,html,yml,md}'),
          ),
        },
        check: false,
      });
    };
  }

  return function () {
    logger.warn('Prettier is not available, ignoring this task');
  };
}

export function prettierCheckTask(options: PrettierTaskOptions = {}): TaskFunction {
  const prettierBin = resolve('prettier/bin-prettier.js');

  if (prettierBin) {
    return function prettierCheck() {
      return runPrettierAsync({
        prettierBin,
        ...{ configPath: options.configPath || undefined },
        ...{ ignorePath: options.ignorePath || undefined },
        ...{
          files: arrayify(
            options.files || path.resolve(process.cwd(), '**', '*.{ts,tsx,js,jsx,json,scss,html,yml,md}'),
          ),
        },
        check: true,
      });
    };
  }

  return function () {
    logger.warn('Prettier is not available, ignoring this task');
  };
}

function runPrettierAsync(context: PrettierContext) {
  const MaxFileEntriesPerChunk = 20;
  const { prettierBin, configPath, ignorePath, files, check } = context;

  const chunks = splitArrayIntoChunks(files, MaxFileEntriesPerChunk);

  return chunks.reduce((finishPromise, chunk) => {
    const prettierArgs = [
      prettierBin,
      ...(configPath ? ['--config', configPath] : []),
      ...(ignorePath ? ['--ignore-path', ignorePath] : []),
      ...(check ? ['--check'] : ['--write']),
      ...chunk,
    ];

    logger.info(process.execPath + ' ' + prettierArgs.join(' '));

    return finishPromise.then(() => spawn(process.execPath, prettierArgs, { stdio: 'inherit' }));
  }, Promise.resolve());
}
