import { resolve } from 'path';

/**
 * Normalizes paths in cmd args so test comparisons work no matter the machine it runs on.
 */
export function normalizeCmdArgsForTest(cmdArgs: string[]) {
  const packageRootDir = process.cwd();
  const repoRootDir = resolve(packageRootDir, '../..');
  const programFilesDir = process.env['ProgramFiles'];

  if (!cmdArgs) {
    return cmdArgs;
  }

  return cmdArgs.map(arg => {
    let newArg = undefined;
    if (programFilesDir && arg.indexOf(programFilesDir) >= 0) {
      newArg = arg.replace(programFilesDir, '${programFiles}');
    } else if (arg.indexOf(packageRootDir) >= 0) {
      newArg = arg.replace(packageRootDir, '${packageRoot}');
    } else if (arg.indexOf(repoRootDir) >= 0) {
      newArg = arg.replace(repoRootDir, '${repoRoot}');
    }
    if (newArg) {
      // Convert backslashes to forward slashes
      return newArg.replace(/\\/g, '/');
    }
    return arg;
  });
}
