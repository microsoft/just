import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import * as mockfs from 'mock-fs';
import { spawn } from '../../utils';
import { webpackCliTask } from '../webpackCliTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedSpawnArgs } from './getNormalizedSpawnArgs';

jest.mock('../../utils/exec', () => {
  const originalModule = jest.requireActual<typeof import('../../utils/exec')>('../../utils/exec');
  return {
    ...originalModule,
    spawn: jest.fn(() => Promise.resolve()).mockName('spawn'),
  };
});
jest.mock('just-task/lib/logger');

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

const relativeRepoRoot = '../..';

function mockFsWebpackCli(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/webpack-cli/bin/cli.js`]: 'a file',
    [`${root}/node_modules/webpack-cli/package.json`]: '{"main":"bin/cli.js"}',
  };
}

describe('webpackCliTask (mocked)', () => {
  const mockWebpackCliArgs = ['${nodeExecPath}', '${repoRoot}/node_modules/webpack-cli/bin/cli.js'];

  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('error conditions', () => {
    it('throws if webpack-cli is not found', () => {
      mockfs({});
      expect(() => webpackCliTask()).toThrow('cannot find webpack-cli');
    });
  });

  describe('basic invocation', () => {
    it('runs webpack-cli with no extra args', async () => {
      mockfs({ ...mockFsWebpackCli() });
      const task = webpackCliTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(mockWebpackCliArgs);
    });
  });

  describe('CLI options', () => {
    beforeEach(() => {
      mockfs({ ...mockFsWebpackCli() });
    });

    it('passes nodeArgs before webpack-cli command', async () => {
      const task = webpackCliTask({ nodeArgs: ['--max-old-space-size=4096'] });
      await callTaskForTest(task);
      const args = getNormalizedSpawnArgs(mockSpawn);
      expect(args[1]).toBe('--max-old-space-size=4096');
      expect(args[2]).toBe('${repoRoot}/node_modules/webpack-cli/bin/cli.js');
    });

    it('passes webpackCliArgs after webpack-cli command', async () => {
      const task = webpackCliTask({ webpackCliArgs: ['--display-errors', '--mode', 'production'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
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
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        '${nodeExecPath}',
        '--max-old-space-size=4096',
        '${repoRoot}/node_modules/webpack-cli/bin/cli.js',
        '--mode',
        'production',
      ]);
    });
  });

  describe('env', () => {
    it('passes env to spawn', async () => {
      mockfs({ ...mockFsWebpackCli() });
      const env = { NODE_ENV: 'production' };
      const task = webpackCliTask({ env });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      expect(mockSpawn.mock.calls[0][2]?.env).toEqual(env);
    });
  });
});
