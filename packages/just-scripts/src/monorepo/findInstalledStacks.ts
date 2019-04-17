import path from 'path';
import { StackInfo } from '../stack/StackInfo';
import { readPackageJson } from 'just-scripts-utils';
import { getAvailableStacks } from '../stack/getAvailableStacks';

// Fetch templates for installation - fetches templates for project generation
// - looks at scripts/package.json just.stacks
// - for each stack listed, return the {name, description, version}

export function findInstalledStacks(rootPath: string) {
  const scriptsPath = path.join(rootPath, 'scripts');
  const stacks = Object.keys(getAvailableStacks(scriptsPath))
    .filter(stack => !stack.includes('monorepo'))
    .map(stack => [stack, path.join(scriptsPath, 'node_modules', stack)]);

  return stacks.map<StackInfo>(([stack, stackPath]) => {
    const packageJson = readPackageJson(stackPath)!; // already checked existence above
    return {
      description: packageJson.description!,
      name: stack,
      version: packageJson.version,
      path: stackPath
    };
  });
}
