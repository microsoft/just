import nodePlop from 'node-plop';
import path from 'path';
import { logger } from 'just-task-logger';

export function getPlopGenerator(plopfilePath: string, destBasePath: string, stackName: string) {
  const plopfile = path.join(plopfilePath, 'plopfile.js');
  const plop = nodePlop(plopfile, { destBasePath, force: false });
  let generator = plop.getGenerator(`repo:${stackName}`) as any;
  if (!generator) {
    generator = plop.getGenerator('repo') as any;
  }

  return generator;
}

export async function runGenerator(generator: any, args: any) {
  const results = await generator.runActions(args, {
    onComment: (comment: string) => {
      logger.info(comment);
    }
  });

  if (results.failures && results.failures.length > 0) {
    throw new Error('Error: ' + results.failures[0].error);
  }

  // do something after the actions have run
  for (let change of results.changes) {
    if (change.path) {
      logger.info(change.path);
    }
  }
}
