import { describe, expect, it, jest } from '@jest/globals';
import path from 'path';
import { spawnNode } from '../exec';
import { getMockScript } from '../../__tests__/getMockScript';
import type { SubprocessError } from 'nano-spawn';

jest.mock('just-task/lib/logger');

describe('spawnNode', () => {
  it('handles success case', async () => {
    const result = await spawnNode(getMockScript('mock-success.js'), [], { stdio: 'pipe' });
    expect(result.stdout).toContain('hello');
  });

  it('passes args to the script', async () => {
    const result = await spawnNode(getMockScript('mock-success.js'), ['arg1', 'arg2'], { stdio: 'pipe' });
    expect(result.stdout).toContain('hello arg1 arg2');
  });

  it('passes nodeArgs to the command', async () => {
    const mockScript = getMockScript('mock-success.js');
    const result = await spawnNode(mockScript, ['arg1', 'arg2'], {
      stdio: 'pipe',
      nodeArgs: ['--version'],
    });
    if (process.platform === 'win32') {
      // nano-spawn quotes things in .command on windows
      expect(result.command).toEqual(`'${process.execPath}' --version '${mockScript}' arg1 arg2`);
    } else {
      expect(result.command).toEqual(`${process.execPath} --version ${mockScript} arg1 arg2`);
    }
    // If nodeArgs are passed correctly, the script prints the version instead of "hello arg1 arg2"
    expect(result.stdout).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('rejects if the script exits non-zero', async () => {
    const error = await spawnNode(getMockScript('mock-fail.js'), [], { stdio: 'pipe' }).catch(
      err => err as SubprocessError,
    );
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      exitCode: 1,
      stderr: expect.stringContaining('oh no'),
      message: expect.stringContaining('Command failed'),
    });
  });

  it('rejects if the script does not exist', async () => {
    const error = await spawnNode(path.join(__dirname, 'nope.js'), [], { stdio: 'pipe' }).catch(
      err => err as SubprocessError,
    );
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      exitCode: 1,
      stderr: expect.stringContaining('Cannot find module'),
      message: expect.stringContaining('Command failed'),
    });
  });
});
