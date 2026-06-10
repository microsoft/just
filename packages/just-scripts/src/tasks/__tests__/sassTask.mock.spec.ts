import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import { globSync as _globSync } from 'glob';
import path from 'path';
import { sassTask } from '../sassTask';
import { tryRequire } from '../../tryRequire';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');
jest.mock('../../tryRequire', () => ({ tryRequire: jest.fn(() => null) }));
jest.mock('glob', () => ({ globSync: jest.fn() }));
// Mock fs.writeFileSync
jest.mock('fs', () => ({ ...jest.requireActual<typeof import('fs')>('fs'), writeFileSync: jest.fn() }));

const mockSassModule = {
  compile: jest.fn<(_path: string, _opts?: unknown) => { css: string }>(() => ({
    css: '.test { color: red; }',
  })),
  render: jest.fn<(_opts: unknown, cb: (err: null, result: { css: Buffer }) => void) => void>((_opts, cb) => {
    cb(null, { css: Buffer.from('.test { color: red; }') });
  }),
};
// node-sass only provides the legacy `render()` callback API (no `compile()`).
const mockNodeSassModule = {
  render: jest.fn<(_opts: unknown, cb: (err: null, result: { css: Buffer }) => void) => void>((_opts, cb) => {
    cb(null, { css: Buffer.from('.test { color: red; }') });
  }),
};
const mockPostcssModule = () => ({
  process: () => Promise.resolve({ css: '.test{color:red}' }),
});

const mockGlobSync = _globSync as jest.MockedFunction<typeof _globSync>;
const mockTryRequire = tryRequire as jest.MockedFunction<(name: string) => unknown>;

const mockCreateSourceModule = jest.fn((_fileName: string, css: string) => `export default ${JSON.stringify(css)};`);

describe('sassTask (mocked)', () => {
  beforeEach(() => {
    mockGlobSync.mockReturnValue([]);
    mockTryRequire.mockImplementation(() => null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('skip conditions', () => {
    it('does nothing if sass is not installed', async () => {
      mockTryRequire.mockImplementation((name: string) => {
        if (name === 'postcss') return () => ({});
        if (name === 'autoprefixer') return () => ({});
        return null;
      });
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
    });

    it('does nothing if postcss is not installed', async () => {
      mockTryRequire.mockImplementation((name: string) => {
        if (name === 'sass') return mockSassModule;
        if (name === 'autoprefixer') return () => ({});
        return null;
      });
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockSassModule.compile).not.toHaveBeenCalled();
      expect(mockSassModule.render).not.toHaveBeenCalled();
    });

    it('does nothing if autoprefixer is not installed', async () => {
      mockTryRequire.mockImplementation((name: string) => {
        if (name === 'sass') return mockSassModule;
        if (name === 'postcss') return () => ({});
        return null;
      });
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockSassModule.compile).not.toHaveBeenCalled();
      expect(mockSassModule.render).not.toHaveBeenCalled();
    });

    it('does nothing if no scss files found', async () => {
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockSassModule.compile).not.toHaveBeenCalled();
      expect(mockSassModule.render).not.toHaveBeenCalled();
    });
  });

  describe('compilation with modern sass compile() API', () => {
    beforeEach(() => {
      mockTryRequire.mockImplementation((name: string) => {
        switch (name) {
          case 'sass':
            return mockSassModule;
          case 'postcss':
            return mockPostcssModule;
          case 'autoprefixer':
          case 'postcss-rtl':
          case 'postcss-clean':
            return () => ({});
          default:
            return null;
        }
      });

      // Mock glob to return one scss file
      mockGlobSync.mockReturnValue(['src/styles/main.scss']);
    });

    it('calls sass.compile for each file (not render)', async () => {
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockSassModule.compile).toHaveBeenCalledTimes(1);
      expect(mockSassModule.compile).toHaveBeenCalledWith(path.resolve('src/styles/main.scss'), expect.any(Object));
      expect(mockSassModule.render).not.toHaveBeenCalled();
    });

    it('writes output as .ts file via createSourceModule', async () => {
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockCreateSourceModule).toHaveBeenCalledWith(path.resolve('src/styles/main.scss'), '.test{color:red}');
      expect(fs.writeFileSync).toHaveBeenCalledWith(path.resolve('src/styles/main.scss') + '.ts', expect.any(String));
    });

    it('processes multiple scss files', async () => {
      mockGlobSync.mockReturnValue(['src/a.scss', 'src/b.scss', 'src/c.scss']);
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockSassModule.compile).toHaveBeenCalledTimes(3);
    });
  });

  describe('compilation with legacy render() API fallback (node-sass)', () => {
    beforeEach(() => {
      mockTryRequire.mockImplementation((name: string) => {
        switch (name) {
          // Only node-sass is available, which lacks compile() so render() is used.
          case 'node-sass':
            return mockNodeSassModule;
          case 'postcss':
            return mockPostcssModule;
          case 'autoprefixer':
          case 'postcss-rtl':
          case 'postcss-clean':
            return () => ({});
          default:
            return null;
        }
      });

      // Mock glob to return one scss file
      mockGlobSync.mockReturnValue(['src/styles/main.scss']);
    });

    it('calls sass.render for each file', async () => {
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockNodeSassModule.render).toHaveBeenCalledTimes(1);
      expect(mockNodeSassModule.render).toHaveBeenCalledWith(
        expect.objectContaining({ file: path.resolve('src/styles/main.scss') }),
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
      mockGlobSync.mockReturnValue(['src/a.scss', 'src/b.scss', 'src/c.scss']);
      const task = sassTask({ createSourceModule: mockCreateSourceModule });
      await callTaskForTest(task);
      expect(mockNodeSassModule.render).toHaveBeenCalledTimes(3);
    });
  });
});
