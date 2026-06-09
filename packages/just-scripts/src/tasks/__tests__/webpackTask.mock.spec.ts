import { describe, expect, it, jest, afterEach } from '@jest/globals';
import fs from 'fs';
import { webpackTask } from '../webpackTask';
import { callTaskForTest } from './callTaskForTest';
import { tryRequire } from '../../tryRequire';
import path from 'path';

jest.mock('just-task/lib/logger');

jest.mock('fs', () => ({
  ...jest.requireActual<typeof fs>('fs'),
  writeFileSync: jest.fn(),
}));
const writeFileSpy = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

const mockWebpack = jest.fn<(configs: unknown, cb: (err: Error | null, stats: unknown) => void) => void>();
jest.mock('../../tryRequire', () => ({
  tryRequire: jest.fn((name: string) => (name === 'webpack' ? mockWebpack : null)),
}));
const mockTryRequire = tryRequire as jest.MockedFunction<typeof tryRequire>;

// Mock findWebpackConfig to return null by default (no config file)
jest.mock('../../webpack/findWebpackConfig', () => ({
  findWebpackConfig: jest.fn(() => null),
}));

// Mock enableTypeScript
jest.mock('just-task', () => ({
  ...jest.requireActual<typeof import('just-task')>('just-task'),
  enableTypeScript: jest.fn(),
}));

describe('webpackTask (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockWebpack.mockImplementation(() => undefined);
  });

  describe('skip conditions', () => {
    it('does nothing if webpack is not installed', async () => {
      mockTryRequire.mockReturnValueOnce(null);
      const task = webpackTask();
      await callTaskForTest(task);
      expect(mockWebpack).not.toHaveBeenCalled();
    });
  });

  describe('basic invocation', () => {
    it('calls webpack with merged config', async () => {
      mockWebpack.mockImplementation((_configs, cb) => {
        cb(null, { hasErrors: () => false });
      });
      const task = webpackTask({ devtool: 'source-map', config: path.join(__dirname, 'webpack.mock.config.js') });
      await callTaskForTest(task);
      expect(mockWebpack).toHaveBeenCalledWith([{ devtool: 'source-map', mode: 'development' }], expect.any(Function));
    });
  });

  describe('error handling', () => {
    it('rejects on webpack error with stats', async () => {
      mockWebpack.mockImplementation((_configs, cb) => {
        cb(new Error('build error'), {
          hasErrors: () => true,
          toString: () => 'error details',
          toJson: () => ({ errors: [{ message: 'err' }] }),
        });
      });
      const task = webpackTask();
      await expect(callTaskForTest(task)).rejects.toEqual('Webpack failed with 1 error(s).');
    });

    it('rejects on webpack error without stats', async () => {
      mockWebpack.mockImplementation((_configs, cb) => {
        cb(new Error('fatal error'), null);
      });
      const task = webpackTask();
      await expect(callTaskForTest(task)).rejects.toEqual('Webpack failed with error(s).');
    });

    it('rejects on stats.hasErrors()', async () => {
      mockWebpack.mockImplementation((_configs, cb) => {
        cb(null, {
          hasErrors: () => true,
          toString: () => 'error details',
          toJson: () => ({ errors: [{ message: 'err1' }, { message: 'err2' }] }),
        });
      });
      const task = webpackTask();
      await expect(callTaskForTest(task)).rejects.toEqual('Webpack failed with 2 error(s).');
    });
  });

  describe('onCompile callback', () => {
    it('calls onCompile with err and stats', async () => {
      const onCompile = jest.fn<(err: Error | null, stats: any) => void>();
      mockWebpack.mockImplementation((_configs, cb) => {
        cb(null, { hasErrors: () => false });
      });
      const task = webpackTask({ onCompile });
      await callTaskForTest(task);
      expect(onCompile).toHaveBeenCalledWith(null, expect.objectContaining({ hasErrors: expect.any(Function) }));
    });
  });

  describe('outputStats', () => {
    it('writes stats.json when outputStats is true', async () => {
      mockWebpack.mockImplementation((_configs, cb) => {
        cb(null, { hasErrors: () => false, toJson: () => ({ assets: [] }) });
      });
      const task = webpackTask({ outputStats: true });
      await callTaskForTest(task);
      expect(writeFileSpy).toHaveBeenCalledWith('stats.json', expect.any(String));
    });

    it('writes to custom file when outputStats is a string', async () => {
      mockWebpack.mockImplementation((_configs, cb) => {
        cb(null, { hasErrors: () => false, toJson: () => ({ assets: [] }) });
      });
      const task = webpackTask({ outputStats: 'build-stats.json' });
      await callTaskForTest(task);
      expect(writeFileSpy).toHaveBeenCalledWith('build-stats.json', expect.any(String));
    });
  });
});
