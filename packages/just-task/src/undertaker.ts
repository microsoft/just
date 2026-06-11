import { logger } from './logger';
import chalk from 'chalk';
import { wrapTask } from './wrapTask';
import type { Task } from './interfaces';
import Undertaker from 'undertaker';

const undertaker = new Undertaker();
const NS_PER_SEC = 1e9;

let topLevelTask: string | undefined = undefined;
let errorReported = false;
const tasksInProgress: { [key: string]: boolean } = {};

const colors = [chalk.cyanBright, chalk.magentaBright, chalk.blueBright, chalk.greenBright, chalk.yellowBright];
const taskColor: { [taskName: string]: number } = {};
let colorIndex = 0;

// https://github.com/gulpjs/undertaker/blob/2d95b5273d6a61fd4ca09376e91faae1045bbbe2/lib/helpers/createExtensions.js#L36
type UndertakerEventArgs = { name: string; branch?: boolean };
type UndertakerEndEventArgs = UndertakerEventArgs & { duration: [number, number] };

function shouldLog(taskArgs: UndertakerEventArgs) {
  return (
    !taskArgs.branch &&
    taskArgs.name !== '<anonymous>' &&
    !taskArgs.name.endsWith('?') &&
    taskArgs.name !== '_wrapFunction' &&
    taskArgs.name !== 'default'
  );
}

function colorizeTaskName(taskName: string) {
  if (taskColor[taskName] === undefined) {
    taskColor[taskName] = colorIndex;
    colorIndex = (colorIndex + 1) % colors.length;
  }

  return colors[taskColor[taskName]](taskName);
}

undertaker.on('start', function (args: UndertakerEventArgs) {
  if (shouldLog(args)) {
    if (!topLevelTask) {
      topLevelTask = args.name;
    }

    tasksInProgress[args.name] = true;

    logger.info(`started '${colorizeTaskName(args.name)}'`);
  }
});

undertaker.on('stop', function (args: UndertakerEndEventArgs) {
  if (shouldLog(args)) {
    const duration = args.duration;
    const durationInSecs = Math.round(((duration[0] * NS_PER_SEC + duration[1]) / NS_PER_SEC) * 100) / 100;

    delete tasksInProgress[args.name];

    logger.info(`finished '${colorizeTaskName(args.name)}' in ${chalk.yellow(String(durationInSecs) + 's')}`);
  }
});

undertaker.on('error', function (args: UndertakerEndEventArgs & { error: unknown }) {
  delete tasksInProgress[args.name];

  if (!errorReported) {
    errorReported = true;
    logger.error(chalk.red(`Error detected while running '${colorizeTaskName(args.name)}'`));
    logger.error(chalk.yellow('------------------------------------'));

    const error = args.error as Partial<Error> & { stdout?: string; stderr?: string };
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const stackOrMessage = error.stack || error.message || String(error || '');
    if (stackOrMessage) {
      logger.error(chalk.yellow(stackOrMessage));
    }

    if (error.stdout) {
      logger.error(chalk.yellow('stdout:'));
      logger.error(String(error.stdout));
    }

    if (error.stderr) {
      logger.error(chalk.yellow('stderr:'));
      logger.error(String(error.stderr));
    }

    logger.error(chalk.yellow('------------------------------------'));

    process.exitCode = 1;
  } else if (shouldLog(args)) {
    const duration = args.duration;
    const durationInSecs = Math.round(((duration[0] * NS_PER_SEC + duration[1]) / NS_PER_SEC) * 100) / 100;
    logger.error(
      `finished '${colorizeTaskName(args.name)}' in ${chalk.yellow(String(durationInSecs) + 's')} with ${chalk.red(
        'errors',
      )}`,
    );
    process.exitCode = 1;
  }

  if (topLevelTask === args.name) {
    process.exit(1);
  }
});

process.on('exit', code => {
  if (code !== 0) {
    logger.error(chalk.dim(`Error previously detected. See above for error messages.`));
  }

  if (Object.keys(tasksInProgress).length > 0) {
    logger.error(
      `Other tasks that did not complete: [${Object.keys(tasksInProgress)
        .map(taskName => colorizeTaskName(taskName))
        .join(', ')}]`,
    );
  }
});

export function parallel(...tasks: Task[]): Undertaker.TaskFunction {
  const newTasks = tasks.map(task => (typeof task === 'string' ? task : wrapTask(task)));

  return undertaker.parallel(newTasks);
}

export function series(...tasks: Task[]): Undertaker.TaskFunction {
  const newTasks = tasks.map(task => (typeof task === 'string' ? task : wrapTask(task)));

  return undertaker.series(newTasks);
}

undertaker.series.bind(undertaker);

export { undertaker };
