import { DiffInfo } from './DiffInfo';
import { diff_match_patch } from 'diff-match-patch';
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import { logger } from 'just-task';

export function applyStackDiffs(projectPath: string, diffInfo: DiffInfo) {
  const dmp = new diff_match_patch();

  const globbedFiles = glob
    .sync('**/*', { cwd: projectPath, ignore: 'node_modules/**/*', nodir: true })
    .concat(glob.sync('**/.*', { cwd: projectPath, ignore: 'node_modules/**/*', nodir: true }));

  globbedFiles.forEach(file => {
    const filePath = path.join(projectPath, file);

    if (diffInfo.patches[file]) {
      logger.info(`Patching ${file}`);
      const content = fs.readFileSync(filePath).toString();
      fs.writeFileSync(filePath, dmp.patch_apply(diffInfo.patches[file], content));
    }
  });
}
