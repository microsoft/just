import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { execNode } from '../../utils/exec';
import { tscTask, tscWatchTask } from '../tscTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedExecArgs } from './getNormalizedExecArgs';

jest.mock('just-task/lib/logger');

jest.mock('../../utils/exec', () => ({ execNode: jest.fn() }));
const mockExec = execNode as jest.MockedFunction<typeof execNode>;

/**
 * Returns the composition of the `tsc.js` Node module in terms `mock-fs` understands, which is necessary for Node's
 * module loader to succeed.
 */
function mockFsTsc(relativePath?: string) {
  // Relative to cwd when the test runs
  const relativeRepoRoot = '../..';
  const ourRelativePath = relativePath || relativeRepoRoot;

  return {
    [`${ourRelativePath}/node_modules/typescript/lib/tsc.js`]: 'a file',
    [`${ourRelativePath}/node_modules/typescript/package.json`]: '{"bin":{"tsc":"lib/tsc.js"}}',
  };
}

describe(`tscTask (mocked)`, () => {
  const mockTscArgs = ['${repoRoot}/node_modules/typescript/lib/tsc.js'];

  beforeEach(() => {
    // Pre-apply the most common mock tsc setup
    mockfs({
      ...mockFsTsc(),
      'tsconfig.json': 'a file',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('basic arguments treatment', () => {
    it('runs command with no arguments', async () => {
      const task = tscTask();
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)).toEqual([
        [...mockTscArgs, '--project', '${packageRoot}/tsconfig.json'],
        // doesn't pass empty nodeArgs
        {},
      ]);
    });

    it('runs command with empty options', async () => {
      const task = tscTask({});
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([...mockTscArgs, '--project', '${packageRoot}/tsconfig.json']);
    });

    it('runs command with options', async () => {
      // freeze to verify it's not modified
      const givenOptions = Object.freeze({ allowJs: true, outDir: 'some/out/path' });
      const task = tscTask(givenOptions);
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockTscArgs,
        '--allowJs',
        '--outDir',
        'some/out/path',
        '--project',
        '${packageRoot}/tsconfig.json',
      ]);
    });

    it('respects nodeArgs', async () => {
      const task = tscTask({ nodeArgs: ['--max-old-space-size=4096'] });
      await callTaskForTest(task);
      expect(mockExec).toHaveBeenCalledTimes(1);
      expect(getNormalizedExecArgs(mockExec)).toEqual([
        [...mockTscArgs, '--project', '${packageRoot}/tsconfig.json'],
        { nodeOptions: ['--max-old-space-size=4096'] },
      ]);
    });
  });

  describe('tsconfig.json handling', () => {
    it('does nothing if tsconfig.json does not exist at package root', async () => {
      mockfs({
        ...mockFsTsc(),
      });

      const task = tscTask();
      await callTaskForTest(task);
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('respects valid "project" option', async () => {
      mockfs({
        ...mockFsTsc(),
        'a/custom/path': {
          'tsconfig.json': 'a file',
        },
      });
      const task = tscTask({ project: 'a/custom/path/tsconfig.json' });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([...mockTscArgs, '--project', 'a/custom/path/tsconfig.json']);
    });

    it('does nothing with invalid "project" option', async () => {
      mockfs({
        ...mockFsTsc(),
      });
      const task = tscTask({ project: 'a/custom/path/tsconfig.json' });
      await callTaskForTest(task);
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('respects valid "build" option', async () => {
      mockfs({
        ...mockFsTsc(),
        'a/custom/path': {
          'tsconfig.json': 'a file',
        },
      });
      const task = tscTask({ build: 'a/custom/path/tsconfig.json' });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([...mockTscArgs, '--build', 'a/custom/path/tsconfig.json']);
    });

    it('ignores invalid "build" option', async () => {
      mockfs({
        ...mockFsTsc(),
      });
      const task = tscTask({ build: 'a/custom/path/tsconfig.json' });
      await callTaskForTest(task);
      expect(mockExec).not.toHaveBeenCalled();
    });

    it('respects multiple valid "build" options', async () => {
      mockfs({
        ...mockFsTsc(),
        'project/a': {
          'tsconfig.json': 'a file',
        },
        'project/b': {
          'tsconfig.json': 'a file',
        },
        'project/c': {
          'tsconfig.json': 'a file',
        },
      });
      const task = tscTask({
        build: ['project/a/tsconfig.json', 'project/b/tsconfig.json', 'project/c/tsconfig.json'],
      });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockTscArgs,
        '--build',
        'project/a/tsconfig.json',
        'project/b/tsconfig.json',
        'project/c/tsconfig.json',
      ]);
    });

    it('does nothing if "build" option is multiple paths and some do not exist', async () => {
      mockfs({
        ...mockFsTsc(),
        'project/a': {
          'tsconfig.json': 'a file',
        },
      });
      const task = tscTask({
        build: ['project/a/tsconfig.json', 'project/b/tsconfig.json', 'project/c/tsconfig.json'],
      });
      await callTaskForTest(task);
      expect(mockExec).not.toHaveBeenCalled();
    });
  });

  describe('CLI option formatting', () => {
    it('handles string value option', async () => {
      const task = tscTask({ module: 'ESNext' });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockTscArgs,
        '--module',
        'ESNext',
        '--project',
        '${packageRoot}/tsconfig.json',
      ]);
    });

    it('handles string array option', async () => {
      const task = tscTask({ lib: ['es6', 'dom', 'esnext.intl'] });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockTscArgs,
        '--lib',
        'es6',
        'dom',
        'esnext.intl',
        '--project',
        '${packageRoot}/tsconfig.json',
      ]);
    });

    it('handles boolean true switch', async () => {
      const task = tscTask({ allowJs: true });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockTscArgs,
        '--allowJs',
        '--project',
        '${packageRoot}/tsconfig.json',
      ]);
    });

    it('ignores boolean false switch', async () => {
      const task = tscTask({ allowJs: false });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([...mockTscArgs, '--project', '${packageRoot}/tsconfig.json']);
    });

    it('puts --build arg first if specified', async () => {
      const task = tscTask({ allowJs: true, build: 'tsconfig.json', outDir: 'some/out/path' });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockTscArgs,
        // The --build arg MUST be first if specified
        '--build',
        'tsconfig.json',
        '--allowJs',
        '--outDir',
        'some/out/path',
      ]);
    });
  });

  describe('typescript resolution', () => {
    // All the other cases test typescript from the repo root
    it('uses typescript from package root', async () => {
      mockfs({
        ...mockFsTsc('.'),
        'tsconfig.json': 'a file',
      });
      const task = tscTask();
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        '${packageRoot}/node_modules/typescript/lib/tsc.js',
        '--project',
        '${packageRoot}/tsconfig.json',
      ]);
    });

    it('returns error if typescript is not found at the package or repo root', async () => {
      mockfs({
        'tsconfig.json': 'a file',
      });
      await expect(callTaskForTest(tscTask())).rejects.toThrow('Cannot find typescript CLI');
    });
  });

  // This is the same internal implementation, so just have one test
  describe('tscWatchTask', () => {
    it('passes watch option to tsc', async () => {
      const task = tscWatchTask();
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockTscArgs,
        '--watch',
        '--project',
        '${packageRoot}/tsconfig.json',
      ]);
    });
  });
});
