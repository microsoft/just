import { paths, logger, prettyPrintMarkdown, downloadPackage } from 'just-scripts-utils';
import path from 'path';
import { readdirSync } from 'fs';
import fse from 'fs-extra';
import prompts from 'prompts';
import { execSync } from 'child_process';
import yargs from 'yargs';
import { getPlopGenerator, getGeneratorArgs, runGenerator } from '../plop';
import * as pkg from '../packageManager';

const initCwd = process.cwd();

function checkEmptyRepo(projectPath: string) {
  return readdirSync(projectPath).length === 0;
}

async function getStackPath(pathName: string, registry?: string) {
  if (pathName.match(/^\./)) {
    // relative to initCwd
    return path.join(initCwd, pathName);
  } else if (pathName.match(/\//)) {
    // absolute path
    return pathName;
  }

  // download it from feed
  return await downloadPackage(pathName, undefined, registry);
}

/**
 * Init involves these steps:
 * 1. pick stack
 * 2. pick name
 * 3. plop!
 * 4. git init and commit
 * 5. yarn install
 */
export async function initCommand(argv: yargs.Arguments) {
  // TODO: autosuggest just-stack-* packages from npmjs.org
  if (!argv.stack) {
    const { stack } = await prompts({
      type: 'select',
      name: 'stack',
      message: 'What type of repo to create?',
      choices: [{ title: 'React App', value: 'just-stack-react' }, { title: 'Monorepo', value: 'just-stack-monorepo' }]
    });
    argv.stack = stack;
  }

  let name = '';
  if (!argv.name && !checkEmptyRepo(paths.projectPath)) {
    const response = await prompts({
      type: 'text',
      name: 'name',
      message: 'What is the name of the repo to create?',
      validate: name => (!name ? false : true)
    });
    name = response.name;
    paths.projectPath = path.join(paths.projectPath, name);
  } else if (!argv.name) {
    name = path.basename(paths.projectPath);
  } else {
    name = argv.name;
    paths.projectPath = path.join(paths.projectPath, name);
  }

  argv.name = name;

  const stackPath = await getStackPath(argv.stack, argv.registry);
  const generator = getPlopGenerator(stackPath!, paths.projectPath);
  const generatorArgs = await getGeneratorArgs(generator, argv);

  console.log(`
stack path: ${stackPath}
project path: ${paths.projectPath}
stack: ${argv.stack}
`);

  await runGenerator(generator, generatorArgs);

  logger.info(`Initializing the repo in ${paths.projectPath}`);

  pkg.install(argv.registry, paths.projectPath);

  try {
    execSync('git init', { cwd: paths.projectPath });
    execSync('git add .', { cwd: paths.projectPath });
    execSync('git commit -m "initial commit"', { cwd: paths.projectPath });
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
}
