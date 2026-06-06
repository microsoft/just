import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { spawn } from '../../utils';
import { eslintTask } from '../eslintTask';
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

function mockFsEslint(relativePath?: string) {
  const root = relativePath || '../..';
  return {
    [`${root}/node_modules/eslint/bin/eslint.js`]: 'a file',
    [`${root}/node_modules/eslint/package.json`]: '{"main":"bin/eslint.js"}',
  };
}

describe('eslintTask (mocked)', () => {
  const mockEslintArgs = ['${nodeExecPath}', '${repoRoot}/node_modules/eslint/bin/eslint.js'];

  beforeEach(() => {
    mockfs({
      ...mockFsEslint(),
      '.eslintrc.json': 'a file',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockfs.restore();
  });

  describe('basic invocation', () => {
    it('runs eslint with default options', async () => {
      const task = eslintTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockEslintArgs,
        '.',
        '--ext',
        '.js,.jsx,.ts,.tsx',
        '--config',
        '${packageRoot}/.eslintrc.json',
        '--color',
      ]);
    });

    it('passes custom files', async () => {
      const task = eslintTask({ files: ['src/', 'lib/'] });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockEslintArgs,
        'src/',
        'lib/',
        '--ext',
        '.js,.jsx,.ts,.tsx',
        '--config',
        '${packageRoot}/.eslintrc.json',
        '--color',
      ]);
    });

    it('passes custom extensions', async () => {
      const task = eslintTask({ extensions: '.ts,.tsx' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual([
        ...mockEslintArgs,
        '.',
        '--ext',
        '.ts,.tsx',
        '--config',
        '${packageRoot}/.eslintrc.json',
        '--color',
      ]);
    });
  });

  describe('skip conditions', () => {
    it('does nothing if eslint is not found', async () => {
      mockfs({
        '.eslintrc.json': 'a file',
      });
      const task = eslintTask();
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });

    it('does nothing if no eslint config file exists', async () => {
      mockfs({
        ...mockFsEslint(),
      });
      const task = eslintTask();
      await callTaskForTest(task);
      expect(spawn).not.toHaveBeenCalled();
    });
  });

  describe('config file detection', () => {
    it('detects .eslintrc.js', async () => {
      mockfs({
        ...mockFsEslint(),
        '.eslintrc.js': 'a file',
      });
      const task = eslintTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(
        expect.arrayContaining(['--config', '${packageRoot}/.eslintrc.js']),
      );
    });

    it('uses custom configPath', async () => {
      mockfs({
        ...mockFsEslint(),
        'custom/.eslintrc.json': 'a file',
      });
      const task = eslintTask({ configPath: 'custom/.eslintrc.json' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--config', 'custom/.eslintrc.json']));
    });
  });

  describe('CLI options', () => {
    it('passes --fix', async () => {
      const task = eslintTask({ fix: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--fix']));
    });

    it('passes --max-warnings', async () => {
      const task = eslintTask({ maxWarnings: 0 });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--max-warnings', '0']));
    });

    it('passes --cache', async () => {
      const task = eslintTask({ cache: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--cache']));
    });

    it('passes --cache-location', async () => {
      const task = eslintTask({ cacheLocation: '.cache/eslint' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--cache-location', '.cache/eslint']));
    });

    it('passes --output-file', async () => {
      const task = eslintTask({ outputFile: 'eslint-report.json' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(
        expect.arrayContaining(['--output-file', 'eslint-report.json']),
      );
    });

    it('passes --format', async () => {
      const task = eslintTask({ format: 'json' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--format', 'json']));
    });

    it('passes --quiet', async () => {
      const task = eslintTask({ quiet: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--quiet']));
    });

    it('passes --no-eslintrc', async () => {
      const task = eslintTask({ noEslintRc: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--no-eslintrc']));
    });

    it('passes --report-unused-disable-directives', async () => {
      const task = eslintTask({ reportUnusedDisableDirectives: true });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--report-unused-disable-directives']));
    });

    it('passes --ignore-path', async () => {
      mockfs({
        ...mockFsEslint(),
        '.eslintrc.json': 'a file',
        '.eslintignore': 'a file',
      });
      const task = eslintTask({ ignorePath: '.eslintignore' });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--ignore-path', '.eslintignore']));
    });
  });

  describe('environment variables', () => {
    it('sets TIMING env var when timing is true', async () => {
      const task = eslintTask({ timing: true });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      const env = mockSpawn.mock.calls[0][2]?.env;
      expect(env?.TIMING).toBe('1');
    });

    it('sets ESLINT_USE_FLAT_CONFIG env var when useFlatConfig is true', async () => {
      const task = eslintTask({ useFlatConfig: true });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      const env = mockSpawn.mock.calls[0][2]?.env;
      expect(env?.ESLINT_USE_FLAT_CONFIG).toBe('true');
    });

    it('sets ESLINT_USE_FLAT_CONFIG to false when useFlatConfig is false', async () => {
      const task = eslintTask({ useFlatConfig: false });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      const env = mockSpawn.mock.calls[0][2]?.env;
      expect(env?.ESLINT_USE_FLAT_CONFIG).toBe('false');
    });
  });
});
