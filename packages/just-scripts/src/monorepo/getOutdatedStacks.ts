import { findInstalledStacks } from './findInstalledStacks';
import path from 'path';
import { spawn } from 'child_process';

export interface OutdatedInfo {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  location: string;
}

export async function getOutdatedStacks(rootPath: string) {
  const scriptsPath = path.join(rootPath, 'scripts');
  const installedStacks = findInstalledStacks(scriptsPath);

  const outdatedJson: any = await new Promise((resolve, reject) => {
    const cp = spawn('npm', ['outdated', '--json'], { cwd: scriptsPath, stdio: 'pipe' });
    let outdatedJsonStr = '';

    cp.stdout.on('data', data => {
      outdatedJsonStr += data.toString();
    });

    cp.on('exit', () => {
      resolve(JSON.parse(outdatedJsonStr));
    });
  });

  const outdatedStacks: OutdatedInfo[] = [];

  Object.keys(outdatedJson).forEach(name => {
    const outdated = outdatedJson[name];
    const stack = installedStacks.find(stack => stack.name === name);

    if (stack) {
      if (outdated.current !== outdated.wanted) {
        outdatedStacks.push({ ...outdated, name });
      }
    }
  });

  return outdatedStacks;
}
