import type { jest } from '@jest/globals';
import { expect } from '@jest/globals';
import path from 'path';
import type { spawn } from '../../utils/exec';

const packageRootDir = path.resolve(__dirname, '../../..');
const repoRootDir = path.resolve(packageRootDir, '../..');

/**
 * Normalizes paths in cmd args so test comparisons work no matter the machine it runs on.
 * Asserts that spawn was called exactly once.
 * @param spawnSpy Mocked or spied `spawn` function from this package
 * @returns Array of normalized command and arguments
 */
export function getNormalizedSpawnArgs(spawnSpy: jest.SpiedFunction<typeof spawn>): string[] {
  expect(spawnSpy).toHaveBeenCalledTimes(1);
  const [spawnCmd, spawnArgs] = spawnSpy.mock.calls[0];
  expect(spawnCmd).toBe(process.execPath);
  expect(spawnArgs).toBeTruthy();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return normalizeArgs(spawnCmd, spawnArgs!);
}

/**
 * Like {@link getNormalizedSpawnArgs} but returns one array per spawn call,
 * for tasks that call spawn multiple times (e.g. prettierTask with chunked files).
 */
export function getAllNormalizedSpawnArgs(spawnSpy: jest.SpiedFunction<typeof spawn>): string[][] {
  expect(spawnSpy).toHaveBeenCalled();
  return spawnSpy.mock.calls.map(([spawnCmd, spawnArgs]) => {
    expect(spawnCmd).toBe(process.execPath);
    expect(spawnArgs).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return normalizeArgs(spawnCmd, spawnArgs!);
  });
}

function normalizeArgs(spawnCmd: string, spawnArgs: readonly string[]) {
  return [spawnCmd, ...spawnArgs].map(arg =>
    arg
      .replace(process.execPath, '${nodeExecPath}')
      .replace(packageRootDir, '${packageRoot}')
      .replace(repoRootDir, '${repoRoot}')
      // Convert backslashes to forward slashes
      .replace(/\\/g, '/'),
  );
}
