import path from 'path';
import { paths, logger, transform, rushAddPackage, rushUpdate, prettyPrintMarkdown, downloadPackage } from 'just-scripts-utils';
import prompts from 'prompts';
import fse from 'fs-extra';
import { argv } from 'just-task';

export async function addPackageTask() {
  const args = argv();

  if (args.cwd) {
    process.chdir(args.cwd);
  }

  const name =
    args.name ||
    (await prompts({
      type: 'text',
      name: 'name',
      message: 'What is the name of the package?'
    })).name;

  logger.info(`Creating a package called: ${name}`);

  const { installPath } = paths;

  // TODO: do validation that the path is indeed a monorepo

  // TODO: autosuggest just-stack-* packages from npmjs.org
  let response = await prompts({
    type: 'select',
    name: 'type',
    message: 'What type of package to add to the repo?',
    choices: [
      { title: 'Library', value: 'just-stack-single-lib' },
      { title: 'UI Fabric Web Application (React)', value: 'just-stack-uifabric' }
    ]
  });

  const packagePath = path.join(installPath, 'packages', name);
  const templatePath = await downloadPackage(response.type);

  if (templatePath) {
    transform(templatePath, packagePath, {
      name
    });

    rushAddPackage(name, installPath);
    logger.info('Running rush update');
    rushUpdate(installPath);

    logger.info('All Set!');

    const readmeFile = path.join(packagePath, 'README.md');
    if (fse.existsSync(readmeFile)) {
      logger.info('\n' + prettyPrintMarkdown(fse.readFileSync(readmeFile).toString()));
    }
  }
}
