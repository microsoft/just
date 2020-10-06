import {
  logger,
  applyTemplate,
  rushAddPackage,
  rushUpdate,
  prettyPrintMarkdown,
  findMonoRepoRootPath,
  readPackageJson
} from 'just-scripts-utils';
import { argv, TaskFunction } from 'just-task';
import { findInstalledStacks } from '../monorepo/findInstalledStacks';
import * as fse from 'fs-extra';
import * as path from 'path';
import prompts = require('prompts');

export function addPackageTask(): TaskFunction {
  return async function addPackage() {
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

    if (!rootPath) {
      logger.warn('Cannot determine the root path to the mono repo');
      return;
    }

    // TODO: do validation that the path is indeed a monorepo
    const installedStacks = findInstalledStacks(rootPath);

    const response = args.stack
      ? { stack: args.stack }
      : await prompts({
          type: 'select',
          name: 'stack',
          message: 'What type of package to add to the repo?',
          choices: installedStacks.map(stack => ({ title: stack.description, value: stack.name }))
        });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const selectedStack = installedStacks.find(stack => stack.name === response.stack)!;

    if (!selectedStack) {
      logger.warn('Cannot add package if no stack is selected');
      return;
    }

    const packagePath = path.join(rootPath, 'packages', name);
    const templatePath = path.join(selectedStack.path, 'template');

    if (templatePath) {
      applyTemplate(templatePath, packagePath, {
        name
      });

      // Remove some files that aren't relevant for an individual project within a monorepo
      fse.removeSync(path.join(packagePath, '.gitignore'));
      fse.removeSync(path.join(packagePath, '.gitattributes'));
      fse.removeSync(path.join(packagePath, '.vscode'));

      // Remove devDep entry that is not appropriate inside individual project
      const pkgJson = readPackageJson(packagePath);

      if (pkgJson && pkgJson.devDependencies && pkgJson.just && pkgJson.just.stack) {
        delete pkgJson.devDependencies[pkgJson.just.stack];
      }

      fse.writeFileSync(path.join(packagePath, 'package.json'), JSON.stringify(pkgJson, null, 2));

      rushAddPackage(name, rootPath);
      logger.info('Running rush update');
      rushUpdate(rootPath);

      logger.info('All Set!');

      const readmeFile = path.join(packagePath, 'README.md');
      if (fse.existsSync(readmeFile)) {
        logger.info('\n' + prettyPrintMarkdown(fse.readFileSync(readmeFile).toString()));
      }
    }
  };
}
