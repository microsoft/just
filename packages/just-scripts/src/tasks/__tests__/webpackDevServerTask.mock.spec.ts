import { describe, expect, it, jest, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { spawnNode } from '../../utils/exec';
import { webpackDevServerTask } from '../webpackDevServerTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedSpawnArgs } from './getNormalizedSpawnArgs';

jest.mock('just-task/lib/logger');

jest.mock('../../utils/exec', () => ({ spawnNode: jest.fn(() => Promise.resolve()) }));
const mockSpawn = spawnNode as jest.MockedFunction<typeof spawnNode>;

const relativeRepoRoot = '../..';

function getMockDeps() {
  return {
    [`${relativeRepoRoot}/node_modules/webpack-cli/package.json`]: '{}',
    [`${relativeRepoRoot}/node_modules/webpack/bin/webpack.js`]: 'a file',
    [`${relativeRepoRoot}/node_modules/webpack/package.json`]: '{"bin":{"webpack":"bin/webpack.js"}}',
  };
}

describe('webpackDevServerTask (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('error conditions', () => {
    it('throws if webpack-cli is not found', async () => {
      mockfs({});
      const task = webpackDevServerTask();
      await expect(callTaskForTest(task)).rejects.toThrow('Missing webpack-cli package');
    });

    it('throws if webpack is not found', async () => {
      const deps = getMockDeps() as Record<string, string>;
      delete deps[`${relativeRepoRoot}/node_modules/webpack/bin/webpack.js`];
      delete deps[`${relativeRepoRoot}/node_modules/webpack/package.json`];
      mockfs(deps);
      const task = webpackDevServerTask();
      await expect(callTaskForTest(task)).rejects.toThrow('Cannot find webpack package');
    });
  });

  describe('arguments', () => {
    it('uses webpack serve command', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(['${repoRoot}/node_modules/webpack/bin/webpack.js', 'serve']);
    });

    it('passes --open when open option is true', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask({ open: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--open']));
    });

    it('passes --mode', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask({ mode: 'development' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--mode', 'development']));
    });

    it('passes webpackCliArgs', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask({ webpackCliArgs: ['--port', '3000'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--port', '3000']));
    });

    it('passes nodeArgs', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask({ nodeArgs: ['--max-old-space-size=4096'] });
      await callTaskForTest(task);
      expect(mockSpawn.mock.calls[0][2]).toEqual({ nodeArgs: ['--max-old-space-size=4096'] });
    });

    it('passes env variables', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask({ env: { NODE_ENV: 'production' } });
      await callTaskForTest(task);
      expect(mockSpawn.mock.calls[0][2]).toEqual({ env: { NODE_ENV: 'production' } });
    });
  });

  describe('config handling', () => {
    it('passes --config when webpack config exists', async () => {
      mockfs({
        ...getMockDeps(),
        'webpack.serve.config.js': 'a file',
      });
      const task = webpackDevServerTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(
        expect.arrayContaining(['--config', '${packageRoot}/webpack.serve.config.js']),
      );
    });

    it('uses ts-node env when config is a ts file', async () => {
      mockfs({
        ...getMockDeps(),
        'webpack.config.ts': 'a file',
      });
      const task = webpackDevServerTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(
        expect.arrayContaining(['--config', '${packageRoot}/webpack.config.ts']),
      );
      expect(mockSpawn.mock.calls[0][2]).toEqual({
        env: { TS_NODE_COMPILER_OPTIONS: expect.anything(), TS_NODE_TRANSPILE_ONLY: 'true' },
      });
    });

    it('merges provide env with ts-node env when config is a ts file', async () => {
      mockfs({
        ...getMockDeps(),
        'webpack.config.ts': 'a file',
      });
      const task = webpackDevServerTask({
        env: { CUSTOM_ENV: 'value' },
        transpileOnly: false,
        tsconfig: 'tsconfig.json',
      });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(
        expect.arrayContaining(['--config', '${packageRoot}/webpack.config.ts']),
      );
      expect(mockSpawn.mock.calls[0][2]).toEqual({
        env: { CUSTOM_ENV: 'value', TS_NODE_PROJECT: 'tsconfig.json' },
      });
    });

    it('falls back to webpack.config.js', async () => {
      mockfs({
        ...getMockDeps(),
        'webpack.config.js': 'a file',
      });
      const task = webpackDevServerTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(
        expect.arrayContaining(['--config', '${packageRoot}/webpack.config.js']),
      );
    });
  });
});
