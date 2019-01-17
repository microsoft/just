import { paths } from '../paths';
import path from 'path';
import { logger } from '../logger';
import { readdirSync } from 'fs';
import { transform } from '../transform';
import fse from 'fs-extra';
import prompts from 'prompts';
import marked from 'marked';
import TerminalRenderer from 'marked-terminal';

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
      choices: [
        { title: 'Basic library', value: 'single-lib' },
        { title: 'React component library', value: 'single-component-lib' },
        { title: 'React app', value: 'single-app' },
        { title: 'Monorepo', value: 'monorepo' }
      ]
    });
    argv.type = response.type;
  }

  const name = path.basename(__dirname);

  if (checkEmptyRepo(installPath)) {
    logger.info('Initializing the repo in the current directory');

    transform(templatePath(argv.type), installPath, { name });

    // createPackageCommand({ name: 'helloworld', type: 'web' });
    // TODO: add more post-init instructions
    // TODO: run git init && git commit initial commit

    logger.info('All Set! Typing out the contents of the generated README.md');
    logger.info('\n' + marked(fse.readFileSync(path.join(installPath, 'README.md')).toString()));
  } else {
    logger.warn('The current directory is not empty. Please initialize an empty directory.');
  }
}
