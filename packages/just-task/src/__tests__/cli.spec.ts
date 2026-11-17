import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { SubprocessError } from 'nano-spawn';
import type _nanoSpawn from 'nano-spawn';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { pathToFileURL } from 'url';

jest.setTimeout(30000);

let nanoSpawn: typeof _nanoSpawn | undefined;

describe('cli', () => {
  const packageRoot = path.resolve(__dirname, '../..');
  const cliPath = path.join(packageRoot, 'bin/just.js');
  const configPath = path.join(packageRoot, 'lib/__tests__/__mocks__/just.config.js');

  /** Run the built CLI with Node's native config loading. */
  async function runCli(args: string[] = [], configFile = configPath, cwd = packageRoot) {
    nanoSpawn ??= (await import('nano-spawn')).default;
    return nanoSpawn(process.execPath, [cliPath, ...args, '--config', configFile], {
      cwd,
      env: { ...process.env, FORCE_COLOR: '0' },
    })
      .then(res => ({ ...res, exitCode: 0 }))
      .catch(err => err as SubprocessError);
  }

  it('prints the list of available tasks (with descriptions) when no command is given', async () => {
    const { stdout, exitCode } = await runCli();

    expect(exitCode).toBe(0);
    expect(stdout).toContain('All the tasks that are available to just:');
    // The description comes from the unwrapped task function (cli.ts showHelp logic).
    expect(stdout).toContain('clean: this is cleaning');
    expect(stdout).toContain('webpack:promise:fail');
  });

  it('runs a task resolved by name from the config', async () => {
    const { stdout, exitCode } = await runCli(['clean']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("■ started 'clean'");
    expect(stdout).toContain('■ fake cleaning up the build and lib and dist folders');
    expect(stdout).toContain("■ finished 'clean' in");
  });

  it('errors with a non-zero exit code for an unknown command', async () => {
    const { stderr, exitCode } = (await runCli(['does-not-exist'])) as SubprocessError;

    expect(exitCode).toBe(1);
    expect(stderr).toContain('Command not defined: does-not-exist');
  });

  it('exits non-zero when a task fails', async () => {
    const { exitCode, stdout, stderr } = (await runCli(['webpack:promise:fail'])) as SubprocessError;

    expect(exitCode).toBe(1);
    expect(stdout).toContain("started 'webpack:promise:fail'");
    expect(stderr).toContain("Error detected while running 'webpack:promise:fail'");
    expect(stderr).toContain('Error: adsfadsf');
  });

  it('parses the --production flag so the conditional task runs (yargs)', async () => {
    const { stdout, exitCode } = await runCli(['cond', '--production']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain("started 'cond'");
    expect(stdout).toContain("started 'ts'");
    expect(stdout).toContain("started 'eslint'");
    expect(stdout).toContain('fake building with typescript');
    expect(stdout).toContain('fake linting with eslint');
  });

  it('skips the conditional task when --production is not passed (yargs)', async () => {
    const { stdout, exitCode } = await runCli(['cond']);

    expect(exitCode).toBe(0);
    expect(stdout).not.toContain("started 'ts'");
    expect(stdout).not.toContain('fake building with typescript');
    expect(stdout).toContain('fake linting with eslint');
  });

  describe('native config loading', () => {
    let tempRoot: string;
    const justTaskPath = path.join(packageRoot, 'lib/index.js');
    const esmImport = `import { task, option, argv } from ${JSON.stringify(pathToFileURL(justTaskPath).href)};`;
    const cjsImport = `const { task } = require(${JSON.stringify(justTaskPath)});`;

    beforeAll(() => {
      tempRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'just native #')));
    });

    afterAll(() => {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    });

    /** Create an isolated consumer config, including its package module type. */
    function writeConfig(contents: string, extension = 'mjs', packageType?: string) {
      const cwd = fs.mkdtempSync(path.join(tempRoot, 'consumer-'));
      fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(packageType ? { type: packageType } : {}));
      const configFile = path.join(cwd, `just.config.${extension}`);
      fs.writeFileSync(configFile, contents);
      return { cwd, configFile };
    }

    it.each([
      ['js', undefined, false],
      ['js', 'commonjs', false],
      ['js', 'module', true],
      ['cjs', 'module', false],
      ['mjs', 'commonjs', true],
      ['ts', undefined, true],
      ['ts', 'commonjs', false],
      ['ts', 'module', true],
      ['cts', 'module', false],
      ['mts', 'commonjs', true],
    ] as const)('loads .%s in a %s package (ESM: %s)', async (extension, packageType, esm) => {
      const declaration = `const message${extension.endsWith('ts') ? ': string' : ''} = 'native task ran';`;
      const { cwd, configFile } = writeConfig(
        `${esm ? esmImport : cjsImport}\n${declaration}\ntask('native', () => console.log(message));`,
        extension,
        packageType,
      );
      const { exitCode, stdout } = await runCli(['native'], configFile, cwd);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('native task ran');
    });

    it.each([
      ['side effects', `task('native', () => console.log('native task ran'));`],
      ['default initializer', `export default () => task('native', () => console.log('native task ran'));`],
      [
        'async initializer',
        `export default async () => { await new Promise(resolve => setTimeout(resolve, 10)); task('native', () => console.log('native task ran')); };`,
      ],
      ['default task object', `export default { native: () => console.log('native task ran') };`],
      ['named task', `export const native = () => console.log('native task ran');`],
      [
        'default and named tasks',
        `export default () => { throw new Error('default must not be initialized'); }; export const native = () => console.log('native task ran');`,
      ],
      ['top-level await', `await Promise.resolve(); export const native = () => console.log('native task ran');`],
    ])('supports ESM %s', async (_name, contents) => {
      const { cwd, configFile } = writeConfig(`${esmImport}\n${contents}`);
      const { exitCode, stdout } = await runCli(['native'], configFile, cwd);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('native task ran');
    });

    it.each([
      ['initializer', `module.exports = () => task('native', () => console.log('native task ran'));`],
      ['task object', `module.exports = { native: () => console.log('native task ran') };`],
      ['named task', `exports.native = () => console.log('native task ran');`],
      ['default initializer', `exports.default = () => task('native', () => console.log('native task ran'));`],
      [
        'initializer with properties',
        `module.exports = () => task('native', () => console.log('native task ran')); module.exports.extra = () => { throw new Error('not a task'); };`,
      ],
      [
        'transpiled default initializer',
        `Object.defineProperty(exports, '__esModule', { value: true }); exports.default = () => task('native', () => console.log('native task ran'));`,
      ],
      [
        'transpiled named tasks',
        `Object.defineProperty(exports, '__esModule', { value: true }); exports.default = () => { throw new Error('default must not be initialized'); }; exports.native = () => console.log('native task ran');`,
      ],
    ])('supports CommonJS %s', async (_name, contents) => {
      const { cwd, configFile } = writeConfig(`${cjsImport}\n${contents}`, 'cjs');
      const { exitCode, stdout } = await runCli(['native'], configFile, cwd);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('native task ran');
    });

    it('does not initialize a task called default in a default-exported object', async () => {
      const { cwd, configFile } = writeConfig(`export default { default: () => console.log('default task ran') };`);
      const help = await runCli([], configFile, cwd);
      expect(help.exitCode).toBe(0);
      expect(help.stdout).toContain('  default');
      expect(help.stdout).not.toContain('default task ran');
      const result = await runCli(['default'], configFile, cwd);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('default task ran');
    });

    it('parses options registered after asynchronous initialization', async () => {
      const { cwd, configFile } = writeConfig(
        `${esmImport}\nawait Promise.resolve(); option('flag', { boolean: true }); task('native', () => console.log(typeof argv().flag));`,
      );
      const { exitCode, stdout } = await runCli(['native', '--flag'], configFile, cwd);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('boolean');
    });

    it.each([
      ['syntax error', 'export const = ;'],
      ['missing import', `import './missing.mjs';`],
      ['top-level rejection', `await Promise.reject(new Error('config failed'));`],
      ['initializer rejection', `export default async () => { throw new Error('config failed'); };`],
      ['unsupported TypeScript syntax', `enum Unsupported { Value }`],
    ])('reports %s with a nonzero exit code', async (_name, contents) => {
      const { cwd, configFile } = writeConfig(contents, 'mts');
      const { exitCode, stderr } = (await runCli([], configFile, cwd)) as SubprocessError;
      expect(exitCode).toBe(1);
      expect(stderr).toContain(`Invalid configuration file: ${configFile}`);
    });

    it('exits nonzero when no config can be found', async () => {
      const { cwd } = writeConfig('');
      fs.rmSync(path.join(cwd, 'just.config.mjs'));
      const { exitCode, stderr } = (await runCli([], path.join(cwd, 'missing.mjs'), cwd)) as SubprocessError;
      expect(exitCode).toBe(1);
      expect(stderr).toContain('Cannot find config file');
    });
  });
});
