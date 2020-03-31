import Undertaker from 'undertaker';
import { logger } from './logger';
import chalk from 'chalk';
import { wrapTask } from './wrapTask';
import { Task } from './interfaces';
import { clearCache } from './cache';
import { TaskDefinitionRecord } from './TaskDefinitionRecord';

const undertaker = new Undertaker();
const NS_PER_SEC = 1e9;

let topLevelTask: string | undefined = undefined;
let errorReported = false;
const tasksInProgress: { [key: string]: boolean } = {};
const taskDefinitions: { [key: string]: TaskDefinitionRecord } = {};
const colors = [chalk.cyanBright, chalk.magentaBright, chalk.blueBright, chalk.greenBright, chalk.yellowBright];
const taskColor: { [taskName: string]: number } = {};
let colorIndex = 0;

function shouldLog(taskArgs: any) {
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

undertaker.on('define', (args: any) => {
  const taskDefinition = args as TaskDefinitionRecord;
  taskDefinitions[taskDefinition.name] = taskDefinition;
});

undertaker.on('start', function(args: any) {
  if (shouldLog(args)) {
    if (!topLevelTask) {
      topLevelTask = args.name;
    }

    tasksInProgress[args.name] = true;

    logger.info(`started '${colorizeTaskName(args.name)}'`);
    const taskDefinition = taskDefinitions[args.name];
    if (taskDefinition) {
      logger.verbose(taskDefinition.trace);
    }
  }
});

undertaker.on('stop', function(args: any) {
  if (shouldLog(args)) {
    const duration = args.duration;
    const durationInSecs = Math.round(((duration[0] * NS_PER_SEC + duration[1]) / NS_PER_SEC) * 100) / 100;

    delete tasksInProgress[args.name];

    logger.info(`finished '${colorizeTaskName(args.name)}' in ${chalk.yellow(String(durationInSecs) + 's')}`);
  }
});

undertaker.on('error', function(args: any) {
  delete tasksInProgress[args.name];

  if (!errorReported) {
    errorReported = true;
    logger.error(chalk.red(`Error detected while running '${colorizeTaskName(args.name)}'`));
    logger.error(chalk.yellow('------------------------------------'));

    const stackOrMessage = args.error.stack || args.error.message || args.error;

    if (stackOrMessage) {
      logger.error(chalk.yellow(stackOrMessage));
    }

    if (args.error.stdout) {
      logger.error(chalk.yellow('stdout:'));
      logger.error(args.error.stdout);
    }

    if (args.error.stderr) {
      logger.error(chalk.yellow('stderr:'));
      logger.error(args.error.stderr);
    }

    logger.error(chalk.yellow('------------------------------------'));

    clearCache();

    process.exitCode = 1;
  } else if (shouldLog(args)) {
    const duration = args.duration;
    const durationInSecs = Math.round(((duration[0] * NS_PER_SEC + duration[1]) / NS_PER_SEC) * 100) / 100;
    logger.error(`finished '${colorizeTaskName(args.name)}' in ${chalk.yellow(String(durationInSecs) + 's')} with ${chalk.red('errors')}`);
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
        .join(', ')}]`
    );
  }
});

export function parallel(...tasks: Task[]) {
  const newTasks = tasks.map(task => {
    if (typeof task === 'string') {
      return task;
    } else {
      return wrapTask(task);
    }
  });

  return undertaker.parallel(newTasks);
}

export function series(...tasks: Task[]) {
  const newTasks = tasks.map(task => {
    if (typeof task === 'string') {
      return task;
    } else {
      return wrapTask(task);
    }
  });

  return undertaker.series(newTasks);
}

undertaker.series.bind(undertaker);

export { undertaker };
