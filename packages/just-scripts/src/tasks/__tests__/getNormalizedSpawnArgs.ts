import { expect, type jest } from '@jest/globals';
import path from 'path';
import type { spawnNode } from '../../utils/exec';

const packageRootDir = path.resolve(__dirname, '../../..');
const repoRootDir = path.resolve(packageRootDir, '../..');

/**
 * Normalizes paths in cmd args so test comparisons work no matter the machine it runs on.
 * Asserts that spawn was called exactly once.
 * @param execSpy Mocked or spied `spawnNode` function
 * @returns Array of normalized arguments
 */
export function getNormalizedSpawnArgs(execSpy: jest.SpiedFunction<typeof spawnNode>): string[] {
  expect(execSpy).toHaveBeenCalledTimes(1);
  const [program, args] = execSpy.mock.calls[0];
  return normalizeArgs([program, ...(args || [])]);
}

/**
 * Like {@link getNormalizedSpawnArgs} but returns one array per exec call,
 * for tasks that call exec multiple times (e.g. prettierTask with chunked files).
 */
export function getAllNormalizedSpawnArgs(execSpy: jest.SpiedFunction<typeof spawnNode>): string[][] {
  expect(execSpy).toHaveBeenCalled();
  return execSpy.mock.calls.map(([program, args]) => normalizeArgs([program, ...(args || [])]));
}

export function normalizeArgs(args: readonly string[]) {
  return args.map(arg =>
    arg
      .replace(packageRootDir, '${packageRoot}')
      .replace(repoRootDir, '${repoRoot}')
      // Convert backslashes to forward slashes
      .replace(/\\/g, '/'),
  );
}
