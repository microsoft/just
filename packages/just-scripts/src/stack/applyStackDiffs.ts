import { DiffInfo } from './DiffInfo';
import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import { logger } from 'just-task';

export function applyStackDiffs(projectPath: string, diffInfo: DiffInfo) {
  const dmp = new DiffMatchPatch();

  const globbedFiles = glob.sync('**/*', {
    cwd: projectPath,
    ignore: 'node_modules/**/*',
    nodir: true,
    dot: true
  });

  globbedFiles.forEach(file => {
    const filePath = path.join(projectPath, file);

    if (diffInfo.patches[file]) {
      logger.info(`Patching ${file}`);
      const content = fs.readFileSync(filePath).toString();
      const [newContent] = dmp.patch_apply(diffInfo.patches[file], content);
      fs.writeFileSync(filePath, newContent);
    }
  });
}
