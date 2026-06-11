import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { execNode } from '../../utils/exec';
import { webpackCliTask } from '../webpackCliTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedExecArgs } from './getNormalizedExecArgs';

jest.mock('just-task/lib/logger');

jest.mock('../../utils/exec', () => ({ execNode: jest.fn(() => Promise.resolve()) }));
const mockExec = execNode as jest.MockedFunction<typeof execNode>;

const relativeRepoRoot = '../..';

function mockFsWebpackCli(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/webpack-cli/bin/cli.js`]: 'a file',
    [`${root}/node_modules/webpack-cli/package.json`]: '{"bin":{"webpack-cli":"bin/cli.js"}}',
  };
}

describe('webpackCliTask (mocked)', () => {
  const mockWebpackCliArgs = ['${repoRoot}/node_modules/webpack-cli/bin/cli.js'];

  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('error conditions', () => {
    it('throws if webpack-cli is not found', async () => {
      mockfs({});
      const task = webpackCliTask();
      await expect(callTaskForTest(task)).rejects.toThrow('Cannot find webpack-cli');
    });
  });

  describe('basic invocation', () => {
    it('runs webpack-cli with no extra args', async () => {
      mockfs({ ...mockFsWebpackCli() });
      const task = webpackCliTask();
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)).toEqual([mockWebpackCliArgs, {}]);
    });
  });

  describe('CLI options', () => {
    beforeEach(() => {
      mockfs({ ...mockFsWebpackCli() });
    });

    it('passes nodeArgs as nodeOptions', async () => {
      const task = webpackCliTask({ nodeArgs: ['--max-old-space-size=4096'] });
      await callTaskForTest(task);
      const [args, opts] = getNormalizedExecArgs(mockExec);
      expect(args[0]).toBe('${repoRoot}/node_modules/webpack-cli/bin/cli.js');
      expect(opts).toEqual({ nodeOptions: ['--max-old-space-size=4096'] });
    });

    it('passes webpackCliArgs after webpack-cli command', async () => {
      const task = webpackCliTask({ webpackCliArgs: ['--display-errors', '--mode', 'production'] });
      await callTaskForTest(task);
      expect(getNormalizedExecArgs(mockExec)[0]).toEqual([
        ...mockWebpackCliArgs,
        '--display-errors',
        '--mode',
        'production',
      ]);
    });

    it('passes both nodeArgs and webpackCliArgs', async () => {
      const task = webpackCliTask({
        nodeArgs: ['--max-old-space-size=4096'],
        webpackCliArgs: ['--mode', 'production'],
      });
      await callTaskForTest(task);
      const [args, opts] = getNormalizedExecArgs(mockExec);
      expect(args).toEqual(['${repoRoot}/node_modules/webpack-cli/bin/cli.js', '--mode', 'production']);
      expect(opts.nodeOptions).toEqual(['--max-old-space-size=4096']);
    });
  });

  describe('env', () => {
    it('passes env to execNode', async () => {
      mockfs({ ...mockFsWebpackCli() });
      const env = { NODE_ENV: 'production' };
      const task = webpackCliTask({ env });
      await callTaskForTest(task);
      expect(mockExec).toHaveBeenCalledTimes(1);
      expect(mockExec.mock.calls[0][2]).toEqual({ env });
    });
  });

  describe('ts-node env', () => {
    beforeEach(() => {
      mockfs({ ...mockFsWebpackCli() });
    });

    it.each(['webpack.config.ts', 'webpack.config.cts', 'webpack.config.mts'])(
      'enables ts-node transpileOnly for a %s config',
      async configPath => {
        const task = webpackCliTask({ webpackCliArgs: ['--config', configPath] });
        await callTaskForTest(task);
        expect(mockExec.mock.calls[0][2]?.env).toEqual({
          TS_NODE_TRANSPILE_ONLY: 'true',
          TS_NODE_COMPILER_OPTIONS: expect.anything(),
        });
      },
    );

    it('does not enable ts-node env for a .js config', async () => {
      const task = webpackCliTask({ webpackCliArgs: ['--config', 'webpack.config.js'] });
      await callTaskForTest(task);
      expect(mockExec.mock.calls[0][2]?.env).toBeUndefined();
    });
  });
});
