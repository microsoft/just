import chalk from 'chalk';
import yargs from 'yargs';

function logInternal(method: 'info' | 'warn' | 'error', symbol: string, ...args: any[]) {
  const now = new Date();
  const timestamp = chalk.gray(`[${now.toLocaleTimeString()}]`);

  console[method](timestamp, symbol, ...args);
}

export interface ILogger {
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
}

const emptySquare = '\u25a1';
const square = '\u25a0';
const triangle = '\u25b2';

export const logger: ILogger = {
  enableVerbose: !!yargs.argv.verbose,

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
  }
};
