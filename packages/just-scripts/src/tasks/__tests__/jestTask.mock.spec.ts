import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { spawn } from '../../utils';
import { jestTask, type JestTaskOptions } from '../jestTask';
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

    it.each(['js', 'cjs', 'mjs', 'ts'])('finds jest.config.%s', async ext => {
      const configFile = `jest.config.${ext}`;
      mockfs({
        ...mockFsJest(),
        [configFile]: 'a file',
      });
      const task = jestTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockJestArgs,
        '--config',
        `\${packageRoot}/${configFile}`,
        '--colors',
      ]);
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
    // Any new options not directly passed as CLI flags (or options tested elsewhere with more
    // detailed fixtures) should be added to the omitted values. Otherwise, add a test below.
    type CliOptions = Omit<JestTaskOptions, 'config' | 'env' | 'nodeArgs' | '_'>;

    // Verify each relevant option is passed through to the CLI (it's been an issue in the past).
    // Flags with different names should specify `flag`.
    // Boolean flags should have undefined values.
    const cliFlags: {
      [K in keyof Required<CliOptions>]: { flag?: string; value?: JestTaskOptions[K] };
    } = {
      rootDir: { value: 'src' },
      runInBand: {},
      coverage: {},
      updateSnapshot: {},
      u: { flag: '--updateSnapshot' },
      watch: {},
      colors: {},
      passWithNoTests: {},
      clearCache: {},
      silent: {},
      testPathPattern: { value: '**/*' },
      testPathPatterns: { value: '**/*' },
      testNamePattern: { value: 'foo' },
      maxWorkers: { value: 4 },
    };

    it.each(Object.keys(cliFlags))('passes %s to CLI', async opt => {
      const flagInfo = cliFlags[opt as keyof typeof cliFlags];
      const { flag = `--${opt}`, value } = flagInfo;

      const task = jestTask({ [opt]: value ?? true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(value ? [flag, String(value)] : [flag]));
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
      // node <nodeArgs> path/to/jest <jestArgs>
      const args = getNormalizedSpawnArgs(mockSpawn);
      expect(args[1]).toBe('--max-old-space-size=4096');
      expect(args[2]).toBe('${repoRoot}/node_modules/jest/bin/jest.js');
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
