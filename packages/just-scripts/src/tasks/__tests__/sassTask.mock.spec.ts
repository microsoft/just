import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { sassTask } from '../sassTask';
import { tryRequire } from '../../tryRequire';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');

// Mocks for sass/postcss/autoprefixer
const mockRender = jest.fn();
const mockProcess = jest.fn();
const mockAutoprefixer = jest.fn(() => 'autoprefixer-plugin');
const mockPostcssRtl = jest.fn(() => 'rtl-plugin');
const mockPostcssClean = jest.fn(() => 'clean-plugin');

jest.mock('../../tryRequire', () => ({
  tryRequire: jest.fn((name: string) => {
    switch (name) {
      case 'sass':
        return { render: mockRender };
      case 'postcss':
        return (_plugins: any[]) => ({ process: mockProcess });
      case 'autoprefixer':
        return mockAutoprefixer;
      case 'postcss-rtl':
        return mockPostcssRtl;
      case 'postcss-clean':
        return mockPostcssClean;
      default:
        return null;
    }
  }),
}));

const mockTryRequire = tryRequire as jest.MockedFunction<typeof tryRequire>;

// Mock glob.sync to control which files are "found"
jest.mock('glob', () => ({
  sync: jest.fn(() => []),
}));

// Mock fs.writeFileSync
jest.mock('fs', () => {
  const actual = jest.requireActual<typeof import('fs')>('fs');
  return { ...actual, writeFileSync: jest.fn() };
});

const mockCreateSourceModule = jest.fn((_fileName: string, css: string) => `export default ${JSON.stringify(css)};`);

describe('sassTask (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('skip conditions', () => {
    it('does nothing if sass is not installed', async () => {
      mockTryRequire.mockImplementation((name: string) => {
        if (name === 'sass' || name === 'node-sass') return null;
        if (name === 'postcss') return () => ({});
        if (name === 'autoprefixer') return mockAutoprefixer;
        return null;
      });
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockRender).not.toHaveBeenCalled();
    });

    it('does nothing if postcss is not installed', async () => {
      mockTryRequire.mockImplementation((name: string) => {
        if (name === 'sass') return { render: mockRender };
        if (name === 'postcss') return null;
        if (name === 'autoprefixer') return mockAutoprefixer;
        return null;
      });
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockRender).not.toHaveBeenCalled();
    });

    it('does nothing if autoprefixer is not installed', async () => {
      mockTryRequire.mockImplementation((name: string) => {
        if (name === 'sass') return { render: mockRender };
        if (name === 'postcss') return () => ({});
        if (name === 'autoprefixer') return null;
        return null;
      });
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockRender).not.toHaveBeenCalled();
    });

    it('does nothing if no scss files found', async () => {
      (glob.sync as jest.Mock).mockReturnValue([]);
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockRender).not.toHaveBeenCalled();
    });
  });

  describe('compilation', () => {
    beforeEach(() => {
      // Reset tryRequire to default mocks
      mockTryRequire.mockImplementation((name: string) => {
        switch (name) {
          case 'sass':
            return { render: mockRender };
          case 'postcss':
            return (_plugins: any[]) => ({ process: mockProcess });
          case 'autoprefixer':
            return mockAutoprefixer;
          case 'postcss-rtl':
            return mockPostcssRtl;
          case 'postcss-clean':
            return mockPostcssClean;
          default:
            return null;
        }
      });

      // Mock glob to return one scss file
      (glob.sync as jest.Mock).mockReturnValue(['src/styles/main.scss']);

      // Mock sass.render to invoke callback with css
      mockRender.mockImplementation((_opts: any, cb: any) => {
        cb(null, { css: Buffer.from('.test { color: red; }') });
      });

      // Mock postcss process to return processed css
      mockProcess.mockReturnValue(Promise.resolve({ css: '.test{color:red}' }));
    });

    it('calls sass.render for each file', async () => {
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockRender).toHaveBeenCalledTimes(1);
      expect(mockRender).toHaveBeenCalledWith(
        expect.objectContaining({
          file: path.resolve('src/styles/main.scss'),
        }),
        expect.any(Function),
      );
    });

    it('writes output as .ts file via createSourceModule', async () => {
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockCreateSourceModule).toHaveBeenCalledWith(path.resolve('src/styles/main.scss'), '.test{color:red}');
      expect(fs.writeFileSync).toHaveBeenCalledWith(path.resolve('src/styles/main.scss') + '.ts', expect.any(String));
    });

    it('processes multiple scss files', async () => {
      (glob.sync as jest.Mock).mockReturnValue(['src/a.scss', 'src/b.scss', 'src/c.scss']);
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockRender).toHaveBeenCalledTimes(3);
    });
  });

  describe('deprecated function signature', () => {
    it('accepts createSourceModule as first argument', async () => {
      (glob.sync as jest.Mock).mockReturnValue([]);
      const task = sassTask(mockCreateSourceModule);
      await callTaskForTest(task);
      // Just verifying it doesn't throw
    });
  });
});
