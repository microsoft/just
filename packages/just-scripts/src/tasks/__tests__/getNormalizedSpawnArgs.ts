import * as path from 'path';
import type { spawn } from '../../utils/exec';

/**
 * Normalizes paths in cmd args so test comparisons work no matter the machine it runs on.
 * @param spawnSpy Mocked or spied `spawn` function from this package
 * @returns Array of normalized command and arguments
 */
export function getNormalizedSpawnArgs(spawnSpy: jest.SpiedFunction<typeof spawn>) {
  const packageRootDir = path.resolve(__dirname, '../../..');
  const repoRootDir = path.resolve(packageRootDir, '../..');

  expect(spawnSpy).toHaveBeenCalledTimes(1);
  const [spawnCmd, spawnArgs] = spawnSpy.mock.calls[0];
  expect(spawnCmd).toBe(process.execPath);
  expect(spawnArgs).toBeTruthy();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return [spawnCmd, ...spawnArgs!].map(arg =>
    arg
      .replace(process.execPath, '${nodeExecPath}')
      .replace(packageRootDir, '${packageRoot}')
      .replace(repoRootDir, '${repoRoot}')
      // Convert backslashes to forward slashes
      .replace(/\\/g, '/'),
  );
}
