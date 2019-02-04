import path from 'path';
import fse from 'fs-extra';
import { IScriptsPackageJson } from './IScriptsPackageJson';
import { IStackInfo } from './IStackInfo';

// Fetch templates for installation - fetches templates for project generation
// - looks at scripts/package.json just.stacks
// - for each stack listed, return the {name, description, version}

export function findInstalledStacks(rootPath: string) {
  const scriptsPath = path.join(rootPath, 'scripts');
  const packageJson = fse.readJsonSync(path.join(scriptsPath, 'package.json')) as IScriptsPackageJson;

  if (packageJson && packageJson.just && packageJson.just.stacks) {
    const stacks = packageJson.just.stacks.filter(stack => fse.pathExistsSync(path.join(scriptsPath, 'node_modules', stack)));
    return stacks.map<IStackInfo>(stack => {
      const packageJson = fse.readJsonSync(path.join(scriptsPath, 'node_modules', stack, 'package.json'));
      return {
        description: packageJson.description,
        name: stack,
        version: packageJson.version,
        path: path.join(scriptsPath, 'node_modules', stack)
      };
    });
  }

  return [];
}
