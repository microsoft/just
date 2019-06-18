import { paths, logger, applyTemplate, prettyPrintMarkdown, rushUpdate, downloadPackage } from 'just-scripts-utils';
import path from 'path';
import { readdirSync } from 'fs';
import fse from 'fs-extra';
import prompts from 'prompts';
import { execSync, spawnSync } from 'child_process';
import yargs from 'yargs';
import os from 'os';

const initCwd = process.cwd();

function checkEmptyRepo(projectPath: string) {
  return readdirSync(projectPath).length === 0;
}

async function getTemplatePath(pathName: string, registry?: string) {
  if (pathName.match(/^\./)) {
    // relative to initCwd
    return path.join(initCwd, pathName, 'template');
  } else if (pathName.match(/\//)) {
    // absolute path
    return path.join(pathName, 'template');
  }

  // download it from feed
  return await downloadPackage(pathName, undefined, registry);
}

export async function initCommand(argv: yargs.Arguments) {
  // TODO: autosuggest just-stack-* packages from npmjs.org
  if (!argv.stack) {
    const { stack } = await prompts({
      type: 'select',
      name: 'stack',
      message: 'What type of repo to create?',
      choices: [
        { title: 'Monorepo', value: 'just-stack-monorepo' },
        { title: 'UI Fabric React Application', value: 'just-stack-uifabric' },
        { title: 'Basic library', value: 'just-stack-single-lib' }
      ]
    });
    argv.stack = stack;
  }

  let name: string = '';
  if (!argv.name && !checkEmptyRepo(paths.projectPath)) {
    let response = await prompts({
      type: 'text',
      name: 'name',
      message: 'What is the name of the repo to create?',
      validate: (name) => !name ? false : true
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

  const templatePath = await getTemplatePath(argv.stack, argv.registry);

  if (templatePath) {
    applyTemplate(templatePath, paths.projectPath, { name });

    if (argv.stack.includes('monorepo')) {
      rushUpdate(paths.projectPath);
    } else {
      const npmCmd = path.join(path.dirname(process.execPath), os.platform() === 'win32' ? 'npm.cmd' : 'npm');
      spawnSync(npmCmd, ['install', ...(argv.registry ? ['--registry', argv.registry] : [])], { stdio: 'inherit' });
    }

    try {
      execSync('git init');
      execSync('git add .');
      execSync('git commit -m "initial commit"');
    } catch (e) {
      logger.warn('Looks like you may not have git installed or there was some sort of error initializing the git repo');
      logger.info(`
Please make sure you have git installed and then issue the following:

  cd ${paths.projectPath}
  git init
  git add .
  git commit -m "initial commit"

`);
    }

    logger.info('All Set!');

    const readmeFile = path.join(paths.projectPath, 'README.md');
    if (fse.existsSync(readmeFile)) {
      logger.info('\n' + prettyPrintMarkdown(fse.readFileSync(readmeFile).toString()));
    }
  } else {
    logger.error('Having trouble downloading and extracting the template package');
  }
}
