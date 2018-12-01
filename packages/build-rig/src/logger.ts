import chalk from 'chalk';

function getTimestamp() {
  const now = new Date();
  return `[${now.toLocaleTimeString()}]`;
}

export interface ILogger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

export const logger: ILogger = {
  info(msg?: any, ...optionalParams: any[]) {
    console.info.apply(null, [`${chalk.gray(getTimestamp())} ${chalk.cyan('INFO')} ${msg}`, ...optionalParams]);
  },

  warn(msg?: any, ...optionalParams: any[]) {
    console.warn.apply(null, [`${chalk.gray(getTimestamp())} ${chalk.yellow('WARN')} ${msg}`, ...optionalParams]);
  },

  error(msg?: any, ...optionalParams: any[]) {
    console.error.apply(null, [`${chalk.gray(getTimestamp())} ${chalk.redBright('ERROR')} ${msg}`, ...optionalParams]);
  }
};

export const taskLogger = (taskName: string): ILogger => {
  return {
    info(msg?: any, ...optionalParams: any[]) {
      logger.info.apply(null, [`[${chalk.yellow(taskName)}] ${msg}`, ...optionalParams]);
    },

    warn(msg?: any, ...optionalParams: any[]) {
      logger.warn.apply(null, [`[${chalk.yellow(taskName)}] ${msg}`, ...optionalParams]);
    },

    error(msg?: any, ...optionalParams: any[]) {
      logger.error.apply(null, [`[${chalk.yellow(taskName)}] ${msg}`, ...optionalParams]);
    }
  };
};
