import path from 'path';
import fs from 'fs';

export function isMonoRepo(rootPath: string) {
  const scriptsPath = path.join(rootPath, 'scripts');
  return fs.existsSync(scriptsPath);
}
