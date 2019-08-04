import nodePlop from 'node-plop';
import path from 'path';
import { convertToBypass } from './args';

export function getPlopGenerator(plopfilePath: string, destBasePath: string) {
  const plopfile = path.join(plopfilePath, 'plopfile.js');

  console.log(plopfile);
  const plop = nodePlop(plopfile, { destBasePath, force: false });
  return plop.getGenerator('repo') as any;
}

export async function getGeneratorArgs(generator: any, args: any) {
  // run all the generator actions using the data specified
  return await generator.runPrompts(convertToBypass(generator, args));
}

export async function runGenerator(generator: any, answers: any) {
  const results = await generator.runActions(answers, {
    onComment: (comment: string) => {
      console.log(comment);
    }
  });

  if (results.failures && results.failures.length > 0) {
    console.error('Error: ' + results.failures[0].error);
    return;
  }

  // do something after the actions have run
  for (let change of results.changes) {
    if (change.path) {
      console.log(change.path);
    }
  }
}
