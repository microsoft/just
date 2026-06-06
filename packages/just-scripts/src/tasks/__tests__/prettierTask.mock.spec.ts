import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import * as mockfs from 'mock-fs';
import { spawn } from '../../utils';
import { prettierTask, prettierCheckTask } from '../prettierTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedSpawnArgs, getAllNormalizedSpawnArgs } from './getNormalizedSpawnArgs';

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

function mockFsPrettierV2(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/prettier/bin-prettier.js`]: 'a file',
    [`${root}/node_modules/prettier/package.json`]: '{"main":"index.js"}',
  };
}

function mockFsPrettierV3(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/prettier/bin/prettier.cjs`]: 'a file',
    [`${root}/node_modules/prettier/package.json`]: '{"main":"index.js"}',
  };
}

describe('prettierTask (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('skip conditions', () => {
    it('does nothing if prettier is not found', async () => {
      mockfs({});
      const task = prettierTask();
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });
  });

  describe('prettier version resolution', () => {
    it('uses prettier v2 bin path', async () => {
      mockfs({ ...mockFsPrettierV2() });
      const task = prettierTask({ files: ['src/file.ts'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        '${nodeExecPath}',
        '${repoRoot}/node_modules/prettier/bin-prettier.js',
        '--write',
        'src/file.ts',
      ]);
    });

    it('falls back to prettier v3 bin path', async () => {
      mockfs({ ...mockFsPrettierV3() });
      const task = prettierTask({ files: ['src/file.ts'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        '${nodeExecPath}',
        '${repoRoot}/node_modules/prettier/bin/prettier.cjs',
        '--write',
        'src/file.ts',
      ]);
    });
  });

  describe('CLI options', () => {
    beforeEach(() => {
      mockfs({ ...mockFsPrettierV2() });
    });

    it('passes --write by default', async () => {
      const task = prettierTask({ files: ['src/file.ts'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--write']));
    });

    it('passes --check when check option is true', async () => {
      const task = prettierTask({ files: ['src/file.ts'], check: true });
      await callTaskForTest(task);
      const args = getNormalizedSpawnArgs(mockSpawn);
      expect(args).toEqual(expect.arrayContaining(['--check']));
      expect(args).not.toEqual(expect.arrayContaining(['--write']));
    });

    it('passes --config', async () => {
      const task = prettierTask({ files: ['src/file.ts'], configPath: '.prettierrc' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--config', '.prettierrc']));
    });

    it('passes --ignore-path', async () => {
      const task = prettierTask({ files: ['src/file.ts'], ignorePath: '.prettierignore' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--ignore-path', '.prettierignore']));
    });
  });

  describe('prettierCheckTask', () => {
    it('passes --check via prettierCheckTask', async () => {
      mockfs({ ...mockFsPrettierV2() });
      const task = prettierCheckTask({ files: ['src/file.ts'] });
      await callTaskForTest(task);
      const args = getNormalizedSpawnArgs(mockSpawn);
      expect(args).toEqual(expect.arrayContaining(['--check']));
      expect(args).not.toEqual(expect.arrayContaining(['--write']));
    });
  });

  describe('file chunking', () => {
    it('splits files into chunks of 20 and spawns sequentially', async () => {
      mockfs({ ...mockFsPrettierV2() });
      const files = Array.from({ length: 25 }, (_, i) => `src/file${i}.ts`);
      const task = prettierTask({ files });
      await callTaskForTest(task);
      const allCalls = getAllNormalizedSpawnArgs(mockSpawn);
      expect(allCalls).toHaveLength(2);
      // First chunk: 20 files
      expect(allCalls[0].filter(a => a.startsWith('src/file'))).toHaveLength(20);
      // Second chunk: 5 files
      expect(allCalls[1].filter(a => a.startsWith('src/file'))).toHaveLength(5);
    });
  });

  describe('files option', () => {
    beforeEach(() => {
      mockfs({ ...mockFsPrettierV2() });
    });

    it('accepts a string as files option', async () => {
      const task = prettierTask({ files: 'src/single.ts' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['src/single.ts']));
    });

    it('accepts an array as files option', async () => {
      const task = prettierTask({ files: ['a.ts', 'b.ts'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['a.ts', 'b.ts']));
    });
  });
});
