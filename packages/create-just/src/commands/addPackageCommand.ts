import path from 'path';
import { paths } from '../paths';
import { logger } from '../logger';
import { transform } from '../transform';
import prompts from 'prompts';
import * as rush from '../rush';
import { downloadPackage } from '../downloadPackage';

export interface AddPackageCommandArgs {
  name: string;
  type: string;
}
export async function addPackageCommand(args: AddPackageCommandArgs) {
  const name = args.name;

  logger.info(`Creating a ${args.type} package called: ${name}`);

  const { installPath } = paths;

  // TODO: do validation that the path is indeed a monorepo

  // TODO: autosuggest just-stack-* packages from npmjs.org
  if (!args.type) {
    let response = await prompts({
      type: 'select',
      name: 'type',
      message: 'What type of package to add to the repo?',
      choices: [
        { title: 'Library', value: 'just-stack-single-lib' },
        { title: 'UI Fabric Web Application (React)', value: 'just-stack-uifabric' }
      ]
    });
    args.type = response.type;
  }

  const packagePath = path.join(installPath, 'packages', name);
  const templatePath = await downloadPackage(args.type);

  if (templatePath) {
    transform(templatePath, packagePath, {
      name
    });

    rush.addPackage(name, installPath);

    logger.info('Running rush update');
    rush.update(installPath);
  }
}
