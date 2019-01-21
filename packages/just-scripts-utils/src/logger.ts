import chalk from 'chalk';

function getTimestamp() {
  const now = new Date();
  return `[${now.toLocaleTimeString()}]`;
}

export interface ILogger {
  info(msg?: any, ...optionalParams: any[]): void;
  warn(msg?: any, ...optionalParams: any[]): void;
  error(msg?: any, ...optionalParams: any[]): void;
}

export const logger: ILogger = {
  info(msg?: any, ...optionalParams: any[]) {
    console.info.apply(null, [`${chalk.gray(getTimestamp())} ${chalk.green('\u25a0')} ${msg}`, ...optionalParams]);
  },

  warn(msg?: any, ...optionalParams: any[]) {
    console.warn.apply(null, [`${chalk.gray(getTimestamp())} ${chalk.yellow('\u25b2')} ${msg}`, ...optionalParams]);
  },

  error(msg?: any, ...optionalParams: any[]) {
    console.error.apply(null, [`${chalk.gray(getTimestamp())} ${chalk.redBright('x')} ${msg}`, ...optionalParams]);
  }
};
