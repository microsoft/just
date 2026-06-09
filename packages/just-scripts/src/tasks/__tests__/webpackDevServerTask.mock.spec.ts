import { describe, expect, it, jest, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { spawn } from '../../utils';
import { webpackDevServerTask } from '../webpackDevServerTask';
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

function getMockDeps() {
  return {
    [`${relativeRepoRoot}/node_modules/webpack-cli/package.json`]: JSON.stringify({ version: '4.10.0' }),
    [`${relativeRepoRoot}/node_modules/webpack/bin/webpack.js`]: 'a file',
    [`${relativeRepoRoot}/node_modules/webpack/package.json`]: '{"main":"lib/index.js"}',
  };
}

describe('webpackDevServerTask (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('error conditions', () => {
    it('throws if webpack-cli is not found', () => {
      mockfs({});
      expect(() => webpackDevServerTask()).toThrow('Missing webpack-cli package');
    });
  });

  describe('arguments', () => {
    it('uses webpack serve command', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        '${nodeExecPath}',
        '${repoRoot}/node_modules/webpack/bin/webpack.js',
        'serve',
      ]);
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

    it('passes nodeArgs before command', async () => {
      mockfs({ ...getMockDeps() });
      const task = webpackDevServerTask({ nodeArgs: ['--max-old-space-size=4096'] });
      await callTaskForTest(task);
      const args = getNormalizedSpawnArgs(mockSpawn);
      expect(args[1]).toBe('--max-old-space-size=4096');
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
        expect.arrayContaining(['--config', 'webpack.serve.config.js']),
      );
    });

    it('falls back to webpack.config.js', async () => {
      mockfs({
        ...getMockDeps(),
        'webpack.config.js': 'a file',
      });
      const task = webpackDevServerTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--config', 'webpack.config.js']));
    });
  });
});
