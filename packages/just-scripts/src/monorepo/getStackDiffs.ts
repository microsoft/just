import fs from 'fs-extra';
import { downloadPackage, exec, paths, encodeArgs } from 'just-scripts-utils';
import path from 'path';
import { DiffInfo } from './DiffInfo';

export async function getStackDiffs(
  stack: string,
  fromVersion: string,
  toVersion: string
): Promise<DiffInfo> {
  const packagePaths = await Promise.all([
    downloadPackage(stack, fromVersion),
    downloadPackage(stack, toVersion)
  ]);

  fs.mkdirpSync(paths.tempPath('diffs'));

  const diffFile = paths.tempPath('diffs', `${stack}.diff`);

  const tmpErr = fs.createWriteStream(diffFile);

  const pathParts = packagePaths[0]!.split(path.sep);
  const ignoreLeadingPathComponentCount = pathParts.length;

  try {
    const diff = await exec(
      encodeArgs(['git', 'diff', '--no-index', packagePaths[0]!, packagePaths[1]!]).join(' '),
      {
        stderr: tmpErr
      }
    );
  } catch (e) {
    // no error, git uses stderr to write output
  }

  return {
    diffFile,
    ignoreLeadingPathComponentCount,
    fromVersion,
    toVersion
  };
}
