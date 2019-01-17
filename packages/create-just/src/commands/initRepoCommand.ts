import { paths } from '../paths';
import path from 'path';
import { logger } from '../logger';
import { createPackageCommand } from './createPackageCommand';
import { readdirSync } from 'fs';
import { transform } from '../transform';
import { execSync } from 'child_process';

export interface InstallCommandArgs {}

function checkEmptyRepo(installPath: string) {
  return readdirSync(installPath).length === 0;
}

export function initRepoCommand(argv: InstallCommandArgs) {
  const { installPath, repoTemplatePath } = paths;

  if (checkEmptyRepo(installPath)) {
    logger.info('Initializing the repo in the current directory');

    transform(repoTemplatePath, installPath);

    execSync(`${process.execPath} ${path.resolve(__dirname, '../../bin/vsts-auth.js')}`, {
      cwd: path.join(installPath, 'common/config/rush'),
      stdio: 'inherit'
    });

    createPackageCommand({ name: 'helloworld', type: 'web' });

    // TODO: add more post-init instructions
    // TODO: run git init && git commit initial commit
    logger.info('All set!');
  } else {
    logger.warn('The current directory is not empty. Please initialize an empty directory.');
  }
}
