import nodePlop from 'node-plop';
import path from 'path';
import { logger } from 'just-task-logger';
import { downloadPackage } from 'just-scripts-utils';

export async function getPlopGenerator(plopfilePath: string, destBasePath: string, stackName: string) {
  const plopfile = path.join(plopfilePath, 'plopfile.js');
  const plop = nodePlop(plopfile, { destBasePath, force: false });
  plop.load('just-plop-helpers', { force: true, destBasePath }, true);
  let generator = plop.getGenerator(`repo:${stackName}`) as any;

  if (generator.parent) {
    plop.setActionType('repo:parent', async (answers, _config, _plop) => {
      const parentPlopPath = (await downloadPackage(generator.parent))!;
      const parentPlopFilePath = path.join(parentPlopPath, 'plopfile.js');
      const parentPlop = nodePlop(parentPlopFilePath, { destBasePath, force: false });
      const parentGenerator = parentPlop.getGenerator(`repo:${generator.parent}`) as any;
      const results = await parentGenerator.runActions(answers);
      if (results.changes) {
        return results.changes.map(change => change.path).join('\n');
      }
    });
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
