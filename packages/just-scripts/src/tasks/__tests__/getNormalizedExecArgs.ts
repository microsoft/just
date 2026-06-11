import { expect, type jest } from '@jest/globals';
import type execa from 'execa';
import path from 'path';
import type { execNode } from '../../utils/exec';

const packageRootDir = path.resolve(__dirname, '../../..');
const repoRootDir = path.resolve(packageRootDir, '../..');

/**
 * Normalizes paths in cmd args so test comparisons work no matter the machine it runs on.
 * Asserts that spawn was called exactly once.
 * @param execSpy Mocked or spied `execNode` function
 * @returns Array of normalized command and arguments
 */
export function getNormalizedExecArgs(
  execSpy: jest.SpiedFunction<typeof execNode>,
): [string[], Partial<execa.NodeOptions>] {
  expect(execSpy).toHaveBeenCalledTimes(1);
  const [program, args, opts] = execSpy.mock.calls[0];
  return [normalizeArgs(program, args || []), opts || {}];
}

/**
 * Like {@link getNormalizedExecArgs} but returns one array per exec call,
 * for tasks that call exec multiple times (e.g. prettierTask with chunked files).
 */
export function getAllNormalizedExecArgs(execSpy: jest.SpiedFunction<typeof execNode>): string[][] {
  expect(execSpy).toHaveBeenCalled();
  return execSpy.mock.calls.map(([program, args]) => normalizeArgs(program, args || []));
}

function normalizeArgs(program: string, args: readonly string[]) {
  return [program, ...args].map(arg =>
    arg
      .replace(process.execPath, '${nodeExecPath}')
      .replace(packageRootDir, '${packageRoot}')
      .replace(repoRootDir, '${repoRoot}')
      // Convert backslashes to forward slashes
      .replace(/\\/g, '/'),
  );
}
