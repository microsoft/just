import { logger, resolve } from 'just-task';
import { spawn } from 'just-scripts-utils';
import { splitArrayIntoChunks } from '../arrayUtils/splitArrayIntoChunks';

interface PrettierContext {
  prettierBin: string;
  configPath: string;
  ignorePath: string;
  files: string[];
}

export function prettierTask(options: any = {}) {
  const prettierBin = resolve('prettier/bin/prettier.js');

  if (prettierBin) {
    runPrettierAsync({
      prettierBin,
      ...{ configPath: options.configPath || undefined },
      ...{ ignorePath: options.ignorePath || undefined },
      ...{ files: options.files || undefined }
    });
  }

  logger.warn('Prettier is not available, ignoring this task');
}

function runPrettierAsync(context: PrettierContext) {
  const MaxFileEntriesPerChunk = 20;
  const { prettierBin, configPath, ignorePath, files } = context;

  const chunks = splitArrayIntoChunks(files, MaxFileEntriesPerChunk);

  return chunks.reduce((finishPromise, chunk) => {
    const prettierArgs = [
      prettierBin,
      ...(configPath ? ['--config', configPath] : []),
      ...(ignorePath ? ['--ignore-path', ignorePath] : []),
      '--write',
      ...chunk
    ];
    return finishPromise.then(() => spawn(process.execPath, prettierArgs, { stdio: 'inherit' }));
  }, Promise.resolve());
}
