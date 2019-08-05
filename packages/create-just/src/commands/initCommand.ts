import { paths, logger, prettyPrintMarkdown, downloadPackage } from 'just-scripts-utils';
import path from 'path';
import { readdirSync, readFileSync, existsSync } from 'fs';
import prompts from 'prompts';
import { execSync } from 'child_process';
import yargs from 'yargs';
import { getPlopGenerator, runGenerator } from '../plop';
import * as pkg from '../packageManager';

const initCwd = process.cwd();

function checkEmptyRepo(projectPath: string) {
  return readdirSync(projectPath).length === 0;
}

function getStackName(stackPath: string) {
  const packageJson = JSON.parse(readFileSync(path.join(stackPath, 'package.json'), 'utf-8'));
  return packageJson.name;
}

async function getStackPath(pathName: string, registry?: string) {
  if (pathName.match(/^\./)) {
    // relative to initCwd
    return path.join(initCwd, pathName);
  } else if (pathName.match(/^\//)) {
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
      choices: [
        { title: 'React App', value: 'just-stack-react' },
        { title: 'UI Fabric (React)', value: 'just-stack-uifabric' },
        { title: 'Basic TypeScript', value: 'just-stack-single-lib' },
        { title: 'Monorepo', value: 'just-stack-monorepo' }
      ]
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
  const stackName = getStackName(stackPath!);

  logger.info(`Installing dependencies for the stack "${stackName}" itself in order to run code generation`);

  pkg.install(argv.registry, stackPath!);

  const generator = getPlopGenerator(stackPath!, paths.projectPath, stackName);

  logger.info(`Running "${stackName}" code generation actions inside: ${paths.projectPath}`);

  await runGenerator(generator, argv);

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
    process.exit(1);
  }

  logger.info('All Set!');

  showNextSteps(argv, stackName);
}

function showNextSteps(argv: any, stackName: string) {
  logger.info(
    prettyPrintMarkdown(`
You have successfully created a new repo based on the '${argv.stack}' template!

## Keeping Up-to-date
You can keep your build tools up-to-date by updating these two devDependencies:

* ${stackName}
* just-scripts

## Next Steps

To start developing code, you can start the innerloop dev server:

    cd ${paths.projectPath}
    ${pkg.getYarn() ? 'yarn' : 'npm'} start

You can build your project in production mode with these commands:

    cd ${paths.projectPath}
    ${pkg.getYarn() ? 'yarn' : 'npm run'} build

${existsSync(path.join(paths.projectPath, 'plopfile.js')) &&
  `
This repository contains code generators that can be triggered by:

    cd ${paths.projectPath}
    ${pkg.getYarn() ? 'yarn' : 'npm run'} gen

`}`)
  );
}
