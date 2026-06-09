import { describe, expect, it, jest } from '@jest/globals';
import { sync as spawnSync } from 'cross-spawn';
import path from 'path';

// Each spawn transpiles the CLI and config via ts-node, which can take a moment.
jest.setTimeout(30000);

describe('cli', () => {
  const packageRoot = path.resolve(__dirname, '../..');
  const cliPath = path.resolve(__dirname, '../cli.ts');
  const configPath = path.join(__dirname, '__mocks__/just.config.ts');
  // Resolve to an absolute path so the spawned process doesn't depend on its cwd to find ts-node.
  const tsNodeRegister = require.resolve('ts-node/register');

  /**
   * Spawn the just CLI (`src/cli.ts`) in a child node process, transpiling TypeScript
   * on the fly with ts-node, and always pointing it at the mock just.config.ts.
   */
  function runCli(...args: string[]) {
    const result = spawnSync(process.execPath, ['-r', tsNodeRegister, cliPath, ...args, '--config', configPath], {
      cwd: packageRoot,
      env: { ...process.env, TS_NODE_TRANSPILE_ONLY: '1' },
      encoding: 'utf8',
    });

    const stdout = result.stdout || '';
    const stderr = result.stderr || '';
    return {
      stdout,
      stderr,
      /** stdout and stderr combined, for assertions that don't care which stream was used. */
      output: stdout + stderr,
      exitCode: result.status,
    };
  }

  it('prints the list of available tasks (with descriptions) when no command is given', () => {
    const { stdout, exitCode } = runCli();

    expect(exitCode).toBe(0);
    expect(stdout).toContain('All the tasks that are available to just:');
    // The description comes from the unwrapped task function (cli.ts showHelp logic).
    expect(stdout).toContain('clean: this is cleaning');
    expect(stdout).toContain('webpack:promise:fail');
  });

  it('runs a task resolved by name from the config', () => {
    const { stdout, exitCode } = runCli('clean');

    expect(exitCode).toBe(0);
    expect(stdout).toContain("■ started 'clean'");
    expect(stdout).toContain('■ fake cleaning up the build and lib and dist folders');
    expect(stdout).toContain("■ finished 'clean' in");
  });

  it('errors with a non-zero exit code for an unknown command', () => {
    const { stderr, exitCode } = runCli('does-not-exist');

    expect(exitCode).toBe(1);
    expect(stderr).toContain('Command not defined: does-not-exist');
  });

  it('exits non-zero when a task fails', () => {
    const { exitCode, stdout, stderr } = runCli('webpack:promise:fail');

    expect(exitCode).toBe(1);
    expect(stdout).toContain("started 'webpack:promise:fail'");
    expect(stderr).toContain("Error detected while running 'webpack:promise:fail'");
    expect(stderr).toContain('Error: adsfadsf');
  });

  it('parses the --production flag so the conditional task runs (yargs)', () => {
    const { stdout, exitCode } = runCli('cond', '--production');

    expect(exitCode).toBe(0);
    expect(stdout).toContain("started 'cond'");
    expect(stdout).toContain("started 'ts'");
    expect(stdout).toContain("started 'eslint'");
    expect(stdout).toContain('fake building with typescript');
    expect(stdout).toContain('fake linting with eslint');
  });

  it('skips the conditional task when --production is not passed (yargs)', () => {
    const { stdout, exitCode } = runCli('cond');

    expect(exitCode).toBe(0);
    expect(stdout).not.toContain("started 'ts'");
    expect(stdout).not.toContain('fake building with typescript');
    expect(stdout).toContain('fake linting with eslint');
  });
});
