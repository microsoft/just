import fs from 'fs-extra';
import glob from 'glob';
import { downloadPackage } from 'just-scripts-utils';
import path from 'path';
import { DiffInfo } from './DiffInfo';
import { diff_match_patch as DiffMatchPatch, patch_obj as Patch, Diff } from 'diff-match-patch';

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
  const globbedFiles = glob.sync('**/*', { cwd: toPath, nodir: true, dot: true });
  const dmp = new DiffMatchPatch();

  globbedFiles.forEach(file => {
    const toFile = path.join(toPath, file);
    const toContent = fs.readFileSync(toFile).toString();

    const fromFile = path.join(fromPath, file);

    let diffs: Diff[];
    let patches: Patch[];

    if (fs.existsSync(fromFile)) {
      const fromContent = fs.readFileSync(fromFile).toString();
      diffs = dmp.diff_main(fromContent, toContent);
      patches = dmp.patch_make(fromContent, toContent, diffs);
    } else {
      diffs = dmp.diff_main('', toContent);
      patches = dmp.patch_make('', toContent, diffs);
    }

    if (patches && patches.length > 0) {
      diffInfo.patches[file.replace('.hbs', '')] = patches;
    }
  });

  return diffInfo;
}
