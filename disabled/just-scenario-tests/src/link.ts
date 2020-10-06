// Links up all the just-* packages for testing
import * as fs from 'fs';
import * as path from 'path';

export function link(monorepoPath: string, toolsPath: string) {
  const scriptsPath = path.join(monorepoPath, 'scripts');

  ['just-scripts', 'just-scripts-utils', 'just-task', 'just-task-logger', 'just-stack-single-lib', 'just-stack-uifabric'].forEach(pkg => {
    const target = path.join(scriptsPath, 'node_modules', pkg);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }

    fs.symlinkSync(path.join(toolsPath, 'packages', pkg), target, 'junction');
  });
}
