import fs from 'fs-extra';
import glob from 'glob';
import { downloadPackage, logger } from 'just-scripts-utils';
import path from 'path';
import { DiffInfo } from './DiffInfo';
import { diff_match_patch as DiffMatchPatch, patch_obj as Patch, Diff } from 'diff-match-patch';
import { StackVersions } from './StackVersions';
import { readLockFile } from './lockfile';

export async function getSingleStackDiffs(stack: string, fromVersion: string, toVersion: string): Promise<DiffInfo> {
  const packagePaths = await Promise.all([downloadPackage(stack, fromVersion), downloadPackage(stack, toVersion)]);

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

export async function getStackDiffs(rootPath: string, resolvedStacks: StackVersions) {
  const oldStacks = readLockFile(rootPath);

  if (!oldStacks) {
    logger.warn('Lock file not available');
    return null;
  }

  const stackDiffs: { [stack: string]: DiffInfo } = {};

  try {
    await Object.keys(oldStacks).reduce(async (currentPromise, stack) => {
      await currentPromise;
      if (oldStacks[stack] !== resolvedStacks[stack]) {
        stackDiffs[stack] = await getSingleStackDiffs(stack, oldStacks[stack], resolvedStacks[stack]);
      }
    }, Promise.resolve());
  } catch (e) {
    logger.error('Cannot figure out upgrades needed for this repo: ', e);
    return null;
  }

  return stackDiffs;
}
