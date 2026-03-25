import * as cp from 'child_process';
import * as path from 'path';
import { encodeArgs, spawn } from '../exec';
import { getMockScript } from '../../__tests__/getMockScript';
import { MockOutputStream } from '../../__tests__/MockOutputStream';
import { fail } from 'assert';

describe('encodeArgs', () => {
  it('encodes things with spaces with double quotes', () => {
    const args = encodeArgs(['blah blah']);
    expect(args).toEqual(['"blah blah"']);
  });

  it('leaves normal args alone', () => {
    const args = encodeArgs(['this-is-normal']);
    expect(args).toEqual(['this-is-normal']);
  });
});

describe('spawn', () => {
  const spawnSpy = jest.spyOn(cp, 'spawn');

  afterEach(() => {
    spawnSpy.mockClear();
  });

  it('handles success case', async () => {
    const stdout = new MockOutputStream();
    await spawn(process.execPath, [getMockScript('mock-success.js')], { stdout });
    expect(stdout.getOutput()).toContain('hello\n');
  });

  it('rejects promise if command does not exist', async () => {
    try {
      await spawn(path.join(__dirname, 'nope'));
      fail('should have rejected');
    } catch (err) {
      expect((err as any).code).toBe('ENOENT');
    }
  });

  it('handles non-zero exit code', async () => {
    const stderr = new MockOutputStream();
    try {
      await spawn(process.execPath, [getMockScript('mock-fail.js')], { stderr });
      fail('should have rejected');
    } catch (error) {
      expect((error as Error).message).toContain('Command failed');
      expect((error as any).code).toBe(1);
      // in the debugger there are some extra stderr chunks
      expect(stderr.getOutput()).toContain('oh no\n');
    }
  });

  // TODO: in newer node, also test with spawn's signal option
  it('handles signal', async () => {
    const promise = spawn(process.execPath, [getMockScript('mock-forever.js')]);
    const child = spawnSpy.mock.results[0].value as cp.ChildProcess;
    expect(child).toBeTruthy();
    try {
      child.kill('SIGTERM');
      await promise;
      fail('should have rejected');
    } catch (err) {
      expect((err as Error).message).toContain('Command terminated by signal SIGTERM');
      expect((err as any).signal).toBe('SIGTERM');
    }
  });
});
