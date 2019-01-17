import path from 'path';
import { paths } from '../paths';
import { logger } from '../logger';
import { transform } from '../transform';
import * as rush from '../rush';

export interface CreatePackageCommandArgs {
  name: string;
  type: string;
}
export function createPackageCommand(args: CreatePackageCommandArgs) {
  const name = args.name;

  logger.info(`Creating a ${args.type} package called: ${name}`);

  const { installPath, templatePath } = paths;
  const packagePath = path.join(installPath, 'packages', name);
  transform(templatePath(args.type), packagePath, {
    name
  });

  rush.addPackage(name, installPath);

  logger.info('Running rush update');
  rush.update(installPath);
}
