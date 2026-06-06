import { describe, expect, it, jest, afterEach, beforeEach } from '@jest/globals';
import type * as apiExtractor from '@microsoft/api-extractor';
import * as fs from 'fs-extra';
import { apiExtractorVerifyTask, apiExtractorUpdateTask, fixApiFileNewlines } from '../apiExtractorTask';
import { callTaskForTest } from './callTaskForTest';
import { tryRequire } from '../../tryRequire';
import path = require('path');

jest.mock('just-task/lib/logger');

const root = path.resolve('/fake-root');
const packageName = 'foo';
const mockConfig: apiExtractor.IConfigFile = {
  mainEntryPointFilePath: '<projectFolder>/lib/index.d.ts',
};

const mockInvoke = jest.fn<typeof apiExtractor.Extractor.invoke>();
const mockLoadFile = jest.fn<typeof apiExtractor.ExtractorConfig.loadFile>(() => mockConfig);
const mockPrepare = jest.fn<typeof apiExtractor.ExtractorConfig.prepare>(options => {
  const projectFolder = options.configObject.projectFolder || root;
  return {
    // not sure what slash types API Extractor uses, but normalize to OS slashes for mock purposes
    mainEntryPointFilePath: path.normalize(
      options.configObject.mainEntryPointFilePath.replace('<projectFolder>', projectFolder),
    ),
    reportFilePath: path.join(projectFolder, `etc/${packageName}.api.md`),
    reportTempFilePath: path.join(projectFolder, `temp/${packageName}.api.md`),
  } as apiExtractor.ExtractorConfig;
});

jest.mock('../../tryRequire', (): { tryRequire: typeof tryRequire } => ({
  tryRequire: jest.fn((name: string) => {
    if (name === '@microsoft/api-extractor') {
      const mockApiExtractor: Partial<Record<keyof typeof apiExtractor, any>> = {
        Extractor: { invoke: mockInvoke },
        ExtractorConfig: {
          FILENAME: 'api-extractor.json',
          loadFile: mockLoadFile,
          prepare: mockPrepare,
        },
      };
      return mockApiExtractor;
    }
    return null;
  }),
}));

const mockTryRequire = tryRequire as jest.MockedFunction<typeof tryRequire>;

// Mock fs-extra for file existence checks and file operations
jest.mock('fs-extra', () => {
  const actual = jest.requireActual<typeof import('fs-extra')>('fs-extra');
  return {
    ...actual,
    existsSync: jest.fn(() => true),
    mkdirpSync: jest.fn(),
    copyFileSync: jest.fn(),
    readFileSync: jest.fn(() => Buffer.from('line1\nline2\n')),
    writeFileSync: jest.fn(),
  };
});

describe('apiExtractorTask (mocked)', () => {
  beforeEach(() => {
    mockInvoke.mockReturnValue({ succeeded: true } as apiExtractor.ExtractorResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('skip conditions', () => {
    it('does nothing if api-extractor is not installed', async () => {
      mockTryRequire.mockReturnValueOnce(null);
      const task = apiExtractorVerifyTask({});
      await callTaskForTest(task);
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('does nothing if config file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      const task = apiExtractorVerifyTask({});
      await callTaskForTest(task);
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('apiExtractorVerifyTask', () => {
    it('calls Extractor.invoke', async () => {
      mockLoadFile.mockReturnValueOnce({ mainEntryPointFilePath: '<projectFolder>/foo.d.ts' });
      const task = apiExtractorVerifyTask({});
      await callTaskForTest(task);
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(mockInvoke).toHaveBeenCalledWith(
        expect.objectContaining({ mainEntryPointFilePath: path.join(root, 'foo.d.ts') }),
        expect.any(Object),
      );
    });

    it('throws if verification fails', async () => {
      mockInvoke.mockReturnValueOnce({ succeeded: false } as apiExtractor.ExtractorResult);
      const task = apiExtractorVerifyTask({});
      await expect(callTaskForTest(task)).rejects.toThrow('The public API file is out of date');
    });

    it('passes extractorOptions to Extractor.invoke', async () => {
      const task = apiExtractorVerifyTask({ localBuild: true });
      await callTaskForTest(task);
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(mockInvoke).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ localBuild: true }));
    });

    it('calls onResult callback', async () => {
      const result = { succeeded: true };
      mockInvoke.mockReturnValueOnce(result as apiExtractor.ExtractorResult);
      const onResult = jest.fn();
      const task = apiExtractorVerifyTask({ onResult });
      await callTaskForTest(task);
      expect(onResult).toHaveBeenCalledWith(result, expect.any(Object));
    });

    it('calls onConfigLoaded callback', async () => {
      const onConfigLoaded = jest.fn();
      const task = apiExtractorVerifyTask({ onConfigLoaded });
      await callTaskForTest(task);
      expect(onConfigLoaded).toHaveBeenCalled();
    });
  });

  describe('apiExtractorUpdateTask', () => {
    it('does nothing if already up to date', async () => {
      const task = apiExtractorUpdateTask({});
      await callTaskForTest(task);
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });

    it('copies temp file to report file when out of date', async () => {
      // First invoke: out of date. Second invoke: succeeded after update.
      mockInvoke
        .mockReturnValueOnce({ succeeded: false } as apiExtractor.ExtractorResult)
        .mockReturnValueOnce({ succeeded: true } as apiExtractor.ExtractorResult);
      const task = apiExtractorUpdateTask({});
      await callTaskForTest(task);
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        path.join(root, `temp/${packageName}.api.md`),
        path.join(root, `etc/${packageName}.api.md`),
      );
    });

    it('throws if re-verification fails after update', async () => {
      mockInvoke
        .mockReturnValueOnce({ succeeded: false } as apiExtractor.ExtractorResult)
        .mockReturnValueOnce({ succeeded: false } as apiExtractor.ExtractorResult);
      const task = apiExtractorUpdateTask({});
      await expect(callTaskForTest(task)).rejects.toThrow('failed to verify API updates');
    });
  });

  describe('fixApiFileNewlines', () => {
    it('normalizes newlines using sampleFilePath', () => {
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(Buffer.from('sample\r\ncontent')) // sample file
        .mockReturnValueOnce(Buffer.from('line1\nline2\n')); // api file
      fixApiFileNewlines('api.md', { sampleFilePath: 'sample.ts' });
      expect(fs.writeFileSync).toHaveBeenCalledWith('api.md', expect.any(String));
    });

    it('normalizes newlines using explicit newline string', () => {
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(Buffer.from('line1\nline2\n'));
      fixApiFileNewlines('api.md', { newline: '\r\n' });
      expect(fs.writeFileSync).toHaveBeenCalledWith('api.md', 'line1\r\nline2\r\n');
    });

    it('throws if neither sampleFilePath nor newline provided', () => {
      expect(() => fixApiFileNewlines('api.md', {})).toThrow('you must provide either');
    });
  });
});
