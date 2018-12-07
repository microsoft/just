import Undertaker from 'undertaker';
import { taskLogger, logger } from './logger';
import chalk from 'chalk';

const undertaker = new Undertaker();
const NS_PER_SEC = 1e9;

let topLevelTask: string | undefined = undefined;
let errorReported: boolean = false;
let tasksInProgress: { [key: string]: boolean } = {};

function shouldLog(taskArgs: any) {
  return !taskArgs.branch && taskArgs.name !== '<anonymous>' && !taskArgs.name.endsWith('?');
}

undertaker.on('start', function(args: any) {
  if (shouldLog(args)) {
    if (!topLevelTask) {
      topLevelTask = args.name;
    }

    tasksInProgress[args.name] = true;

    taskLogger(args.name).info(`Started '${chalk.cyan(args.name)}'`);
  }
});

undertaker.on('stop', function(args: any) {
  if (shouldLog(args)) {
    const duration = args.duration;
    const durationInSecs = Math.round(((duration[0] * NS_PER_SEC + duration[1]) / NS_PER_SEC) * 100) / 100;

    delete tasksInProgress[args.name];

    taskLogger(args.name).info(`Finished '${chalk.cyan(args.name)}' in ${chalk.yellow(String(durationInSecs) + 's')}`);
  }
});

undertaker.on('error', function(args: any) {
  delete tasksInProgress[args.name];

  if (!errorReported) {
    errorReported = true;
    taskLogger(args.name).error(chalk.red(`Error detected while running '${chalk.cyan(args.name)}'`));
    taskLogger(args.name).error(chalk.yellow('------------------------------------'));
    taskLogger(args.name).error(chalk.yellow(args.error));
    taskLogger(args.name).error(chalk.yellow('------------------------------------'));
  } else if (shouldLog(args)) {
    taskLogger(args.name).error(chalk.dim(`Error previously detected. See above for error messages.`));
  }

  if (topLevelTask === args.name && Object.keys(tasksInProgress).length > 0) {
    logger.error(
      `Other tasks that did not complete: [${Object.keys(tasksInProgress)
        .map(taskName => chalk.cyan(taskName))
        .join(', ')}]`
    );
    process.exit(1);
  }
});

export const parallel: typeof undertaker.parallel = undertaker.parallel.bind(undertaker);
export const series: typeof undertaker.series = undertaker.series.bind(undertaker);

export { undertaker };
