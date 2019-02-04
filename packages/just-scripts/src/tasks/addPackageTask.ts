import path from 'path';
import { logger, transform, rushAddPackage, rushUpdate, prettyPrintMarkdown, findMonoRepoRootPath } from 'just-scripts-utils';
import prompts from 'prompts';
import fse from 'fs-extra';
import { argv } from 'just-task';
import { findInstalledStacks } from '../monorepo/findInstalledStacks';

export async function addPackageTask() {
  const args = argv();
  const rootPath = findMonoRepoRootPath();

  const name =
    args.name ||
    (await prompts({
      type: 'text',
      name: 'name',
      message: 'What is the name of the package?'
    })).name;

  logger.info(`Creating a package called: ${name}`);

  if (rootPath) {
    // TODO: do validation that the path is indeed a monorepo

    const installedStacks = findInstalledStacks(rootPath);

    // TODO: autosuggest just-stack-* packages from npmjs.org
    let response = await prompts({
      type: 'select',
      name: 'stack',
      message: 'What type of package to add to the repo?',
      choices: installedStacks.map(stack => ({ title: stack.description, value: stack.name }))
    });

    const selectedStack = installedStacks.find(stack => stack.name === response.stack)!;

    const packagePath = path.join(rootPath, 'packages', name);
    const templatePath = path.join(selectedStack.path, 'template');

    if (templatePath) {
      transform(templatePath, packagePath, {
        name
      });

      rushAddPackage(name, rootPath);
      logger.info('Running rush update');
      rushUpdate(rootPath);

      fse.removeSync(path.join(packagePath, '.gitignore'));
      fse.removeSync(path.join(packagePath, '.gitattributes'));

      logger.info('All Set!');

      const readmeFile = path.join(packagePath, 'README.md');
      if (fse.existsSync(readmeFile)) {
        logger.info('\n' + prettyPrintMarkdown(fse.readFileSync(readmeFile).toString()));
      }
    }
  } else {
    logger.warn('Cannot determine the root path to the mono repo');
  }
}
