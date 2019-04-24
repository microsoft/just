import { paths, logger, applyTemplate, prettyPrintMarkdown, rushUpdate, downloadPackage } from 'just-scripts-utils';
import path from 'path';
import { readdirSync } from 'fs';
import fse from 'fs-extra';
import prompts from 'prompts';
import { execSync } from 'child_process';
import yargs from 'yargs';

const initCwd = process.cwd();

function checkEmptyRepo(projectPath: string) {
  return readdirSync(projectPath).length === 0;
}

function isFilePath(pathName: string) {
  return pathName.match(/^\./) || pathName.indexOf('/') > -1;
}

export async function initCommand(argv: yargs.Arguments) {
  // TODO: autosuggest just-stack-* packages from npmjs.org
  if (!argv.stack) {
    let response = await prompts({
      type: 'select',
      name: 'stack',
      message: 'What type of repo to create?',
      choices: [
        { title: 'Monorepo', value: 'just-stack-monorepo' },
        { title: 'UI Fabric React Application', value: 'just-stack-uifabric' },
        { title: 'Basic library', value: 'just-stack-single-lib' }
      ]
    });
    argv.stack = response.stack;
  }

  let name: string = '';
  if (!argv.name && !checkEmptyRepo(paths.projectPath)) {
    let response = await prompts({
      type: 'text',
      name: 'name',
      message: 'What is the name of the repo to create?'
    });
    name = response.name;
    paths.projectPath = path.join(paths.projectPath, name);
  } else if (!argv.name) {
    name = path.basename(paths.projectPath);
  } else {
    name = argv.name;
    paths.projectPath = path.join(paths.projectPath, name);
  }

  if (!fse.pathExistsSync(paths.projectPath)) {
    fse.mkdirpSync(paths.projectPath);
  }

  process.chdir(paths.projectPath);

  logger.info(`Initializing the repo in ${paths.projectPath}`);

  const templatePath = isFilePath(argv.stack) ? path.join(initCwd, argv.stack, 'template') : await downloadPackage(argv.stack);

  if (templatePath) {
    applyTemplate(templatePath, paths.projectPath, { name });

    execSync('git init');

    if (argv.stack.includes('monorepo')) {
      rushUpdate(paths.projectPath);
    } else {
      execSync('npm install', { stdio: 'inherit' });
    }

    execSync('git add .');
    execSync('git commit -m "initial commit"');

    logger.info('All Set!');

    const readmeFile = path.join(paths.projectPath, 'README.md');
    if (fse.existsSync(readmeFile)) {
      logger.info('\n' + prettyPrintMarkdown(fse.readFileSync(readmeFile).toString()));
    }
  } else {
    logger.error('Having trouble downloading and extracting the template package');
  }
}
