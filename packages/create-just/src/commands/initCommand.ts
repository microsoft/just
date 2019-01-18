import { paths } from '../paths';
import path from 'path';
import { logger } from '../logger';
import { readdirSync } from 'fs';
import { transform } from '../transform';
import fse from 'fs-extra';
import prompts from 'prompts';
import marked from 'marked';
import TerminalRenderer from 'marked-terminal';
import { execSync } from 'child_process';

export interface InitCommandArgs {
  type: string;
}

function checkEmptyRepo(installPath: string) {
  return readdirSync(installPath).length === 0;
}

export async function initCommand(argv: InitCommandArgs) {
  marked.setOptions({
    renderer: new TerminalRenderer()
  });

  const { installPath, templatePath } = paths;

  if (!argv.type) {
    let response = await prompts({
      type: 'select',
      name: 'type',
      message: 'What type of repo to create?',
      choices: [{ title: 'Basic library', value: 'single-lib' }, { title: 'Monorepo', value: 'monorepo' }]
    });
    argv.type = response.type;
  }

  const name = path.basename(installPath);

  if (checkEmptyRepo(installPath)) {
    logger.info('Initializing the repo in the current directory');

    transform(templatePath(argv.type), installPath, { name });

    // createPackageCommand({ name: 'helloworld', type: 'web' });
    // TODO: add more post-init instructions
    // TODO: run git init && git commit initial commit
    execSync('git init');
    execSync('git add .');
    execSync('git commit -m "initial commit"');

    logger.info('All Set! Typing out the contents of the generated README.md');
    logger.info('\n' + marked(fse.readFileSync(path.join(installPath, 'README.md')).toString()));
  } else {
    logger.warn('The current directory is not empty. Please initialize an empty directory.');
  }
}
