import Undertaker from 'undertaker';
import { taskLogger } from './logger';
import chalk from 'chalk';

const undertaker = new Undertaker();
const NS_PER_SEC = 1e9;

undertaker.on('start', function(args: any) {
  taskLogger(args.name).info(chalk.green('Started'));
});

undertaker.on('stop', function(args: any) {
  const duration = args.duration;
  const durationInSecs = Math.round(((duration[0] * NS_PER_SEC + duration[1]) / NS_PER_SEC) * 100) / 100;

  taskLogger(args.name).info(chalk.green(`Finished in ${durationInSecs}s`));
});

undertaker.on('error', function(args: any) {
  taskLogger(args.name).error(chalk.red('Error detected while running this task'));
  taskLogger(args.name).error(chalk.yellow('------------------------------------'));
  taskLogger(args.name).error(chalk.yellow(args.error));
  taskLogger(args.name).error(chalk.yellow('------------------------------------'));
});

export const parallel: typeof undertaker.parallel = undertaker.parallel.bind(undertaker);
export const series: typeof undertaker.series = undertaker.series.bind(undertaker);
export { undertaker };
