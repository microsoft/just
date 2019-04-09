import { DiffInfo } from './DiffInfo';
import { exec, encodeArgs } from 'just-scripts-utils';

export async function applyStackDiffs(projectPath: string, diffInfo: DiffInfo) {
  await exec(
    encodeArgs([
      'git',
      'apply',
      `-p=${diffInfo.ignoreLeadingPathComponentCount}`,
      diffInfo.diffFile
    ]).join(' '),
    // Note the git stderr is redirected to process.stdout because git status updates are also in stderr
    { cwd: projectPath, stderr: process.stdout, stdout: process.stdout }
  );
}
