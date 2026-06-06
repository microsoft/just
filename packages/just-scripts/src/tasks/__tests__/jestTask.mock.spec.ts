import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import * as mockfs from 'mock-fs';
import { spawn } from '../../utils';
import { jestTask } from '../jestTask';
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
jest.mock('supports-color', () => ({ stdout: true }));

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

const relativeRepoRoot = '../..';

function mockFsJest(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/jest/bin/jest.js`]: 'a file',
    [`${root}/node_modules/jest/package.json`]: '{"main":"bin/jest.js"}',
  };
}

describe('jestTask (mocked)', () => {
  const mockJestArgs = ['${nodeExecPath}', '${repoRoot}/node_modules/jest/bin/jest.js'];

  beforeEach(() => {
    mockfs({
      ...mockFsJest(),
      'jest.config.js': 'a file',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('basic invocation', () => {
    it('runs jest with default options', async () => {
      const task = jestTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockJestArgs,
        '--config',
        '${packageRoot}/jest.config.js',
        '--colors',
      ]);
    });

    it('runs jest with empty options', async () => {
      const task = jestTask({});
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockJestArgs,
        '--config',
        '${packageRoot}/jest.config.js',
        '--colors',
      ]);
    });
  });

  describe('skip conditions', () => {
    it('does nothing if no jest config found', async () => {
      mockfs({
        ...mockFsJest(),
        'package.json': '{}',
      });
      const task = jestTask();
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });

    it('does nothing if jest is not resolved', async () => {
      mockfs({
        'jest.config.js': 'a file',
      });
      const task = jestTask();
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });
  });

  describe('config detection', () => {
    it('detects jest config in package.json', async () => {
      mockfs({
        ...mockFsJest(),
        'package.json': JSON.stringify({ jest: { testMatch: ['**/*.test.ts'] } }),
      });
      const task = jestTask();
      await callTaskForTest(task);
      // When config comes from package.json, no --config arg is passed
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([...mockJestArgs, '--colors']);
    });

    it('uses custom config option', async () => {
      mockfs({
        ...mockFsJest(),
        'custom/jest.config.js': 'a file',
      });
      const task = jestTask({ config: 'custom/jest.config.js' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockJestArgs,
        '--config',
        'custom/jest.config.js',
        '--colors',
      ]);
    });
  });

  describe('CLI options', () => {
    it('passes --coverage', async () => {
      const task = jestTask({ coverage: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--coverage']));
    });

    it('passes --watch', async () => {
      const task = jestTask({ watch: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--watch']));
    });

    it('passes --runInBand', async () => {
      const task = jestTask({ runInBand: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--runInBand']));
    });

    it('passes --passWithNoTests', async () => {
      const task = jestTask({ passWithNoTests: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--passWithNoTests']));
    });

    it('passes --clearCache', async () => {
      const task = jestTask({ clearCache: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--clearCache']));
    });

    it('passes --silent', async () => {
      const task = jestTask({ silent: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--silent']));
    });

    it('passes --rootDir', async () => {
      const task = jestTask({ rootDir: 'src' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--rootDir', 'src']));
    });

    it('passes --testPathPattern', async () => {
      const task = jestTask({ testPathPattern: 'src/test' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--testPathPattern', 'src/test']));
    });

    it('passes --testPathPatterns', async () => {
      const task = jestTask({ testPathPatterns: 'src/test' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--testPathPatterns', 'src/test']));
    });

    it('passes --testNamePattern', async () => {
      const task = jestTask({ testNamePattern: 'should do something' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(
        expect.arrayContaining(['--testNamePattern', 'should do something']),
      );
    });

    it('passes --updateSnapshot', async () => {
      const task = jestTask({ updateSnapshot: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--updateSnapshot']));
    });

    it('passes --updateSnapshot via u shorthand', async () => {
      const task = jestTask({ u: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--updateSnapshot']));
    });

    it('passes --maxWorkers', async () => {
      const task = jestTask({ maxWorkers: 4 });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--maxWorkers', '4']));
    });

    it('includes --colors when supportsColor.stdout is truthy', async () => {
      const task = jestTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--colors']));
    });

    it('omits --colors when colors option is false', async () => {
      const task = jestTask({ colors: false });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).not.toEqual(expect.arrayContaining(['--colors']));
    });
  });

  describe('extra args and env', () => {
    it('includes custom positional args from options._', async () => {
      const task = jestTask({ _: ['path/to/test'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['path/to/test']));
    });

    it('prepends nodeArgs before jest command', async () => {
      const task = jestTask({ nodeArgs: ['--max-old-space-size=4096'] });
      await callTaskForTest(task);
      const args = getNormalizedSpawnArgs(mockSpawn);
      const nodeArgIndex = args.indexOf('--max-old-space-size=4096');
      const jestCmdIndex = args.indexOf('${repoRoot}/node_modules/jest/bin/jest.js');
      expect(nodeArgIndex).toBeLessThan(jestCmdIndex);
    });

    it('passes env to spawn', async () => {
      const env = { NODE_ENV: 'test', CI: 'true' };
      const task = jestTask({ env });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      expect(mockSpawn.mock.calls[0][2]?.env).toEqual(env);
    });
  });
});
