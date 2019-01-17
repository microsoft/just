import path from 'path';
import { paths } from '../paths';
import { logger } from '../logger';
import { transform } from '../transform';
import * as rush from '../rush';

export interface CreatePackageCommandArgs {
  name: string;
  type: 'native' | 'webview' | 'web';
}
export function createPackageCommand(args: CreatePackageCommandArgs) {
  const name = args.name;

  logger.info(`Creating a ${args.type} package called: ${name}`);

  const { installPath, packageTemplatePath } = paths;
  const packagePath = path.join(installPath, 'packages', name);
  const templatePath = path.join(packageTemplatePath, args.type);

  transform(templatePath, packagePath, {
    name
  });

  rush.addPackage(name, installPath);

  logger.info('Running rush update');
  rush.update(installPath);
}
