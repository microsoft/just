import fs from 'fs-extra';
import glob from 'glob';
import { downloadPackage, exec, paths, encodeArgs } from 'just-scripts-utils';
import path from 'path';
import { DiffInfo } from './DiffInfo';
import { diff_match_patch, patch_obj } from 'diff-match-patch';

export async function getStackDiffs(
  stack: string,
  fromVersion: string,
  toVersion: string
): Promise<DiffInfo> {
  const packagePaths = await Promise.all([
    downloadPackage(stack, fromVersion),
    downloadPackage(stack, toVersion)
  ]);

  // Concentrates on new and modified files only
  const diffInfo: DiffInfo = {
    patches: {},
    fromVersion,
    toVersion
  };

  const fromPath = packagePaths[0]!;
  const toPath = packagePaths[1]!;
  const globbedFiles = glob
    .sync('**/*', { cwd: toPath, nodir: true })
    .concat(glob.sync('**/.*', { cwd: toPath, nodir: true }));

  const dmp = new diff_match_patch();

  globbedFiles.forEach(file => {
    const toFile = path.join(toPath, file);
    const toContent = fs.readFileSync(toFile).toString();

    const fromFile = path.join(fromPath, file);

    if (fs.existsSync(fromFile)) {
      const fromContent = fs.readFileSync(fromFile).toString();
      const diffs = dmp.diff_main(fromContent, toContent);
      diffInfo.patches[file.replace('.hbs', '')] = dmp.patch_make(fromContent, diffs);
    } else {
      const diffs = dmp.diff_main('', toContent);
      diffInfo.patches[file.replace('.hbs', '')] = dmp.patch_make('', diffs);
    }
  });

  return diffInfo;
}
