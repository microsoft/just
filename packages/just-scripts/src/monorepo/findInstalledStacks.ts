import path from 'path';
import fse from 'fs-extra';
import { IScriptsPackageJson } from './IScriptsPackageJson';
import { IStackInfo } from './IStackInfo';
import { readPackageJson } from 'just-scripts-utils';

// Fetch templates for installation - fetches templates for project generation
// - looks at scripts/package.json just.stacks
// - for each stack listed, return the {name, description, version}

export function findInstalledStacks(rootPath: string) {
  const scriptsPath = path.join(rootPath, 'scripts');
  const packageJson: IScriptsPackageJson = readPackageJson(scriptsPath)!;

  if (packageJson && packageJson.just && packageJson.just.stacks) {
    const stacks = packageJson.just.stacks
      .map(stack => [stack, path.join(scriptsPath, 'node_modules', stack)])
      .filter(([, stackPath]) => fse.existsSync(stackPath));

    return stacks.map<IStackInfo>(([stack, stackPath]) => {
      const packageJson = readPackageJson(stackPath)!; // already checked existence above
      return {
        description: packageJson.description!,
        name: stack,
        version: packageJson.version,
        path: stackPath
      };
    });
  }

  return [];
}
