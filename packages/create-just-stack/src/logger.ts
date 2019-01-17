import chalk from 'chalk';

function getTimestamp() {
  const now = new Date();
  return `[${now.toISOString()}]`;
}

export const logger = {
  info(msg: string) {
    console.warn(`${chalk.gray(getTimestamp())} ${chalk.cyan('INFO')} ${msg}`);
  },

  warn(msg: string) {
    console.warn(`${chalk.gray(getTimestamp())} ${chalk.yellow('WARN')} ${msg}`);
  },

  error(msg: string) {
    console.warn(`${chalk.gray(getTimestamp())} ${chalk.redBright('ERROR')} ${msg}`);
  }
};
