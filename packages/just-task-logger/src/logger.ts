import chalk from 'chalk';
import yargs from 'yargs';
import { getDeltaAndClearMark } from './perf';

function logInternal(method: 'info' | 'warn' | 'error', symbol: string, ...args: any[]) {
  const now = new Date();
  const timestamp = chalk.gray(`[${now.toLocaleTimeString()}]`);

  console[method](timestamp, symbol, ...args);
}

export interface Logger {
  /** Whether verbose logging is enabled. Default false unless --verbose arg is given. */
  enableVerbose: boolean;
  /** Log to `console.info` with a timestamp, but only if verbose logging is enabled. */
  verbose(...args: any[]): void;
  /** Log to `console.info` with a timestamp. */
  info(...args: any[]): void;
  /** Log to `console.warn` with a timestamp. */
  warn(...args: any[]): void;
  /** Log to `console.error` with a timestamp. */
  error(...args: any[]): void;
  /** Log perf marker data to `consold.info` with timestamp, only if verbose is enabled */
  perf(marker: string, ...args: any[]): void;
}

const emptySquare = '\u25a1';
const square = '\u25a0';
const triangle = '\u25b2';

export const logger: Logger = {
  enableVerbose: !!yargs.argv.verbose || !!process.env.JUST_VERBOSE,

  verbose(...args: any[]) {
    if (logger.enableVerbose) {
      logInternal('info', chalk.gray(emptySquare), ...args);
    }
  },

  info(...args: any[]) {
    logInternal('info', chalk.green(square), ...args);
  },

  warn(...args: any[]) {
    logInternal('warn', chalk.yellow(triangle), ...args);
  },

  error(...args: any[]) {
    logInternal('error', chalk.redBright('x'), ...args);
  },

  perf(marker: string, ...args: any[]) {
    if (logger.enableVerbose) {
      const delta = getDeltaAndClearMark(marker);

      if (delta) {
        const ns = delta[0] * 1e9 + delta[1];
        const deltaMsg = `${ns / 1e9}s`;
        logInternal('info', chalk.cyan(square), `mark(${chalk.cyanBright(marker)}): took ${chalk.cyanBright(deltaMsg)}`, ...args);
      }
    }
  }
};
