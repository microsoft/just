import * as path from 'path';
import * as fs from 'fs';

export function isMonoRepo(rootPath: string): boolean {
  const scriptsPath = path.join(rootPath, 'scripts');
  return fs.existsSync(scriptsPath);
}
