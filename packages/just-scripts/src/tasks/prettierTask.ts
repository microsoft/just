import { tryRequire } from '../tryRequire';
import { logger, resolve } from 'just-task';
import runParallel from 'run-parallel-limit';
import { spawn } from 'just-scripts-utils';

interface PrettierContext {
  prettierBin: string;
  configPath: string;
  ignorePath: string;
  files: string[];
}

export function prettierTask(options: any = {}) {
  const prettierBin = resolve('prettier/bin/prettier.js');

  if (prettierBin) {
  }

  logger.warn('Prettier is not available, ignoring this task');
}

function runPrettier(context: PrettierContext) {
  const extensions = '*.{ts,tsx,js,jsx,json,scss,html,yml,md}';
  const { prettierBin, configPath, ignorePath, files } = context;
  const prettierArgs = [prettierBin, '--config', configPath, '--ignore-path', ignorePath, '--write', ...files];

  spawn(process.execPath, prettierArgs, { stdio: 'inherit' });
}
