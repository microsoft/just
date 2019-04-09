import { DiffInfo } from './DiffInfo';
import { diff_match_patch } from 'diff-match-patch';
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import { logger } from 'just-task';

export function applyStackDiffs(rootPath: string, projectPath: string, diffInfo: DiffInfo) {
  const dmp = new diff_match_patch();

  const globbedFiles = glob
    .sync('**/*', {
      cwd: path.join(rootPath, projectPath),
      ignore: 'node_modules/**/*',
      nodir: true
    })
    .concat(
      glob.sync('**/.*', {
        cwd: path.join(rootPath, projectPath),
        ignore: 'node_modules/**/*',
        nodir: true
      })
    );

  globbedFiles.forEach(file => {
    const filePath = path.join(rootPath, projectPath, file);

    if (diffInfo.patches[file]) {
      logger.info(`Patching ${file}`);
      const content = fs.readFileSync(filePath).toString();
      const [newContent] = dmp.patch_apply(diffInfo.patches[file], content);
      fs.writeFileSync(filePath, newContent);
    }
  });
}
