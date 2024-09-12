import { resolve, logger, resolveCwd, TaskFunction } from 'just-task';
import { spawn, encodeArgs } from 'just-scripts-utils';
import { existsSync } from 'fs';

export interface MochaTaskOptions {
  config?: string;
  allowUncaught?: boolean;
  asyncOnly?: boolean;
  bail?: boolean;
  checkLeaks?: boolean;
  delay?: boolean;
  forbidOnly?: boolean;
  forbidPending?: boolean;
  retries?: number;
  slow?: number;
  timeout?: number;
  ui?: string;
  color?: boolean;
  diff?: boolean;
  fullTrace?: boolean;
  growl?: boolean;
  inlineDiffs?: boolean;
  watch?: boolean;
  _?: string[];

  /**
   * Arguments to be passed into a spawn call for mocha
   */
  nodeArgs?: string[];

  /**
   * Environment variables to be passed to the mocha runner
   */
  env?: NodeJS.ProcessEnv;
}

export function mochaTask(options: MochaTaskOptions = {}): TaskFunction {
  const mochaConfigFile: string | undefined =
    resolveCwd('./.mocharc.js') ||
    resolveCwd('./.mocharc.yaml') ||
    resolveCwd('./.mocharc.yml') ||
    resolveCwd('./.mocharc.jsonc') ||
    resolveCwd('./.mocharc.json') ||
    undefined;

  return function mocha() {
    const mochaCmd = resolve('mocha/bin/mocha');
    const configFile = options.config || mochaConfigFile;

    if (mochaCmd) {
      logger.info(`Running mocha`);
      const cmd = process.execPath;
      const args = [
        ...(options.nodeArgs || []),
        mochaCmd,
        ...(configFile && existsSync(configFile) ? ['--config', configFile] : []),
        ...(options.allowUncaught ? ['--allow-uncaught'] : []),
        ...(options.bail ? ['--bail'] : []),
        ...(options.checkLeaks ? ['--check-leaks'] : []),
        ...(options.delay ? ['--delay'] : []),
        ...(options.forbidOnly ? ['--forbid-only'] : []),
        ...(options.forbidPending ? ['--forbid-pending'] : []),
        ...(options.retries ? ['--retries', options.retries.toString()] : []),
        ...(options.slow ? ['--slow', options.slow.toString()] : []),
        ...(options.timeout ? ['--timeout', options.timeout.toString()] : []),
        ...(options.ui ? ['--ui', options.ui] : []),
        ...(options.color ? ['--color'] : []),
        ...(options.diff ? ['--diff'] : []),
        ...(options.fullTrace ? ['--full-trace'] : []),
        ...(options.growl ? ['--growl'] : []),
        ...(options.inlineDiffs ? ['--inline-diffs'] : []),
        ...(options.watch ? ['--watch'] : []),
        ...(options._ || [])
      ].filter(arg => !!arg) as Array<string>;

      logger.info(cmd, encodeArgs(args).join(' '));

      return spawn(cmd, args, { stdio: 'inherit', env: options.env });
    } else {
      logger.warn('no mocha command found, skipping mocha');
      return Promise.resolve();
    }
  };
}
