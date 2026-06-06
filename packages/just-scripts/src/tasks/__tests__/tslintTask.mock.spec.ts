import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import * as mockfs from 'mock-fs';
import { spawn } from '../../utils';
import { tslintTask } from '../tslintTask';
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

function mockFsTslint(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/tslint/lib/tslintCli.js`]: 'a file',
    [`${root}/node_modules/tslint/package.json`]: '{"main":"index.js"}',
  };
}

function mockFsTslintMicrosoftContrib(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/tslint-microsoft-contrib/index.js`]: 'a file',
    [`${root}/node_modules/tslint-microsoft-contrib/package.json`]: '{"main":"index.js"}',
  };
}

describe('tslintTask (mocked)', () => {
  const mockTslintArgs = ['${nodeExecPath}', '${repoRoot}/node_modules/tslint/lib/tslintCli.js'];

  beforeEach(() => {
    mockfs({
      ...mockFsTslint(),
      ...mockFsTslintMicrosoftContrib(),
      'tsconfig.json': 'a file',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('basic invocation', () => {
    it('runs tslint with default options', async () => {
      const task = tslintTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockTslintArgs,
        '--project',
        '${packageRoot}/tsconfig.json',
        '-t',
        'stylish',
        '-r',
        '${repoRoot}/node_modules/tslint-microsoft-contrib',
      ]);
    });

    it('passes --fix when option is set', async () => {
      const task = tslintTask({ fix: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockTslintArgs,
        '--project',
        '${packageRoot}/tsconfig.json',
        '-t',
        'stylish',
        '-r',
        '${repoRoot}/node_modules/tslint-microsoft-contrib',
        '--fix',
      ]);
    });
  });

  describe('skip conditions', () => {
    it('does nothing if tsconfig.json does not exist', async () => {
      mockfs({
        ...mockFsTslint(),
        ...mockFsTslintMicrosoftContrib(),
      });
      const task = tslintTask();
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });

    it('does nothing if tslint is not resolved', async () => {
      mockfs({
        'tsconfig.json': 'a file',
      });
      const task = tslintTask();
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });
  });

  describe('custom project path', () => {
    it('uses provided project option', async () => {
      mockfs({
        ...mockFsTslint(),
        ...mockFsTslintMicrosoftContrib(),
        'custom/tsconfig.json': 'a file',
      });
      const task = tslintTask({ project: 'custom/tsconfig.json' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockTslintArgs,
        '--project',
        'custom/tsconfig.json',
        '-t',
        'stylish',
        '-r',
        '${repoRoot}/node_modules/tslint-microsoft-contrib',
      ]);
    });

    it('does nothing if custom project path does not exist', async () => {
      mockfs({
        ...mockFsTslint(),
        ...mockFsTslintMicrosoftContrib(),
      });
      const task = tslintTask({ project: 'nonexistent/tsconfig.json' });
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });
  });

  describe('tslint-microsoft-contrib', () => {
    it('still runs when tslint-microsoft-contrib is not available', async () => {
      mockfs({
        ...mockFsTslint(),
        'tsconfig.json': 'a file',
      });
      const task = tslintTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockTslintArgs,
        '--project',
        '${packageRoot}/tsconfig.json',
        '-t',
        'stylish',
        '-r',
        '.',
      ]);
    });
  });
});
