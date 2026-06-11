import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { spawnNode } from '../../utils/exec';
import { jestTask, type JestTaskOptions } from '../jestTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedSpawnArgs } from './getNormalizedSpawnArgs';

jest.mock('just-task/lib/logger');
jest.mock('supports-color', () => ({ stdout: true }));

jest.mock('../../utils/exec', () => ({ spawnNode: jest.fn() }));
const mockSpawn = spawnNode as jest.MockedFunction<typeof spawnNode>;

const relativeRepoRoot = '../..';

function mockFsJest(relativePath?: string) {
  const root = relativePath || relativeRepoRoot;
  return {
    [`${root}/node_modules/jest/bin/jest.js`]: 'a file',
    [`${root}/node_modules/jest/package.json`]: '{"bin":{"jest":"bin/jest.js"}}',
  };
}

describe('jestTask (mocked)', () => {
  const mockJestArgs = ['${repoRoot}/node_modules/jest/bin/jest.js'];

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
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('does nothing if jest is not resolved', async () => {
      mockfs({
        'jest.config.js': 'a file',
      });
      const task = jestTask();
      await callTaskForTest(task);
      expect(mockSpawn).not.toHaveBeenCalled();
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

    it('passes nodeArgs to spawnNode', async () => {
      const task = jestTask({ nodeArgs: ['--max-old-space-size=4096'] });
      await callTaskForTest(task);
      const args = getNormalizedSpawnArgs(mockSpawn);
      expect(args[0]).toBe('${repoRoot}/node_modules/jest/bin/jest.js');
      expect(mockSpawn.mock.calls[0][2]).toEqual({ nodeArgs: ['--max-old-space-size=4096'] });
    });

    it('passes env to spawnNode', async () => {
      const env = { NODE_ENV: 'test', CI: 'true' };
      const task = jestTask({ env });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      expect(mockSpawn.mock.calls[0][2]).toEqual({ env });
    });
  });
});
