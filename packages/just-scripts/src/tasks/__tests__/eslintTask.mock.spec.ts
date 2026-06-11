import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import { eslintTask, type EsLintTaskOptions } from '../eslintTask';
import { callTaskForTest } from './callTaskForTest';
import { spawnNode } from '../../utils/exec';
import { getNormalizedSpawnArgs } from './getNormalizedSpawnArgs';

jest.mock('just-task/lib/logger');

jest.mock('../../utils/exec', () => ({ spawnNode: jest.fn() }));
const mockSpawn = spawnNode as jest.MockedFunction<typeof spawnNode>;

function mockFsEslint(relativePath?: string) {
  const root = relativePath || '../..';
  return {
    [`${root}/node_modules/eslint/bin/eslint.js`]: 'a file',
    [`${root}/node_modules/eslint/package.json`]: '{"bin":"bin/eslint.js"}',
  };
}

describe('eslintTask (mocked)', () => {
  const mockEslintArgs = ['${repoRoot}/node_modules/eslint/bin/eslint.js'];

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
      expect(mockSpawn.mock.calls[0][2]).toEqual({ env: {} });
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
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('does nothing if no eslint config file exists', async () => {
      mockfs({
        ...mockFsEslint(),
      });
      const task = eslintTask();
      await callTaskForTest(task);
      expect(mockSpawn).not.toHaveBeenCalled();
    });
  });

  describe('config file detection', () => {
    it.each([
      '.eslintrc',
      '.eslintrc.cjs',
      '.eslintrc.json',
      'eslint.config.js',
      'eslint.config.mjs',
      'eslint.config.ts',
    ])('detects %s', async name => {
      mockfs({
        ...mockFsEslint(),
        [name]: 'a file',
      });
      const task = eslintTask();
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(['--config', '${packageRoot}/' + name]));
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
    // Any new options not directly passed as CLI flags should be added to the omitted values
    type CliOptions = Omit<EsLintTaskOptions, 'files' | 'configPath' | 'timing' | 'useFlatConfig'>;

    // Verify each relevant option is passed through to the CLI (it's been an issue in the past)
    const cliFlags: {
      [K in keyof Required<CliOptions>]: { flag: string; value?: EsLintTaskOptions[K] };
    } = {
      ignorePath: { flag: '--ignore-path', value: '.gitignore' },
      resolvePluginsPath: { flag: '--resolve-plugins-relative-to', value: 'foo' },
      fix: { flag: '--fix' },
      extensions: { flag: '--ext', value: '.js,.jsx,.ts,.tsx' },
      noEslintRc: { flag: '--no-eslintrc' },
      maxWarnings: { flag: '--max-warnings', value: 0 },
      cache: { flag: '--cache' },
      cacheLocation: { flag: '--cache-location', value: '.cache/eslint' },
      outputFile: { flag: '--output-file', value: 'eslint-report.json' },
      format: { flag: '--format', value: 'json' },
      quiet: { flag: '--quiet' },
      reportUnusedDisableDirectives: { flag: '--report-unused-disable-directives' },
    };

    it.each(Object.keys(cliFlags))('passes %s to CLI', async opt => {
      const { flag, value } = cliFlags[opt as keyof typeof cliFlags];
      const task = eslintTask({ [opt]: value === undefined ? true : value });
      await callTaskForTest(task);
      expect(getNormalizedSpawnArgs(mockSpawn)).toEqual(expect.arrayContaining(value ? [flag, String(value)] : [flag]));
    });

    it('detects .eslintignore and passes as --ignore-path', async () => {
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
      expect(env).toEqual({ TIMING: '1' });
    });

    it('sets ESLINT_USE_FLAT_CONFIG env var when useFlatConfig is true', async () => {
      const task = eslintTask({ useFlatConfig: true });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      const env = mockSpawn.mock.calls[0][2]?.env;
      expect(env).toEqual({ ESLINT_USE_FLAT_CONFIG: 'true' });
    });

    it('sets ESLINT_USE_FLAT_CONFIG to false when useFlatConfig is false', async () => {
      const task = eslintTask({ useFlatConfig: false });
      await callTaskForTest(task);
      expect(mockSpawn).toHaveBeenCalledTimes(1);
      const env = mockSpawn.mock.calls[0][2]?.env;
      expect(env).toEqual({ ESLINT_USE_FLAT_CONFIG: 'false' });
    });
  });
});
