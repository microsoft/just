import { describe, expect, it, jest } from '@jest/globals';
import path from 'path';
import { execNode } from '../exec';
import { getMockScript } from '../../__tests__/getMockScript';
import type execa from 'execa';

jest.mock('just-task/lib/logger');

describe('execNode', () => {
  it('handles success case', async () => {
    const result = await execNode(getMockScript('mock-success.js'), [], { stdio: 'pipe' });
    expect(result.stdout).toContain('hello');
    expect(result.exitCode).toBe(0);
  });

  it('passes args to the script', async () => {
    const result = await execNode(getMockScript('mock-success.js'), ['arg1', 'arg2'], { stdio: 'pipe' });
    expect(result.stdout).toContain('hello arg1 arg2');
  });

  it('rejects if the script exits non-zero', async () => {
    const result = await execNode(getMockScript('mock-fail.js'), [], { stdio: 'pipe' }).catch(
      err => err as execa.ExecaError,
    );
    expect(result).toBeInstanceOf(Error);
    expect(result).toMatchObject({
      exitCode: 1,
      stderr: expect.stringContaining('oh no'),
      message: expect.stringContaining('Command failed'),
    });
  });

  it('rejects if the script does not exist', async () => {
    const result = await execNode(path.join(__dirname, 'nope.js'), [], { stdio: 'pipe' }).catch(
      err => err as execa.ExecaError,
    );
    expect(result).toBeInstanceOf(Error);
    expect(result).toMatchObject({
      exitCode: 1,
      stderr: expect.stringContaining('Cannot find module'),
      message: expect.stringContaining('Command failed'),
    });
  });
});
