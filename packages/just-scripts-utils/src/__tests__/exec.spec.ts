import { encodeArgs, exec, ExecError } from '../exec';
import cp from 'child_process';
import { Readable } from 'stream';

describe('encodeArgs', () => {
  it('encodes things with spaces with double quotes', () => {
    const args = encodeArgs(['blah blah']);
    expect(args[0]).toBe('"blah blah"');
  });

  it('encodes Windows-like paths', () => {
    const args = encodeArgs(['C:\\Program Files\\node\\bin\\node.exe']);
    expect(args[0]).toBe('"C:\\Program Files\\node\\bin\\node.exe"');
  });

  it('leaves normal args alone', () => {
    const args = encodeArgs(['this-is-normal']);
    expect(args[0]).toBe('this-is-normal');
  });
});

describe('exec', () => {
  let execResult: [cp.ExecException | null, string | undefined, string | undefined] | undefined;
  const stdoutPipe = jest.fn();
  const stderrPipe = jest.fn();
  beforeAll(() => {
    jest.spyOn(cp, 'exec').mockImplementation(
      (cmd: string, opts: any, callback: any): cp.ChildProcess => {
        setTimeout(() => {
          callback(...execResult!);
        }, 0);
        return {
          stdout: ({ pipe: stdoutPipe } as any) as Readable,
          stderr: ({ pipe: stderrPipe } as any) as Readable
        } as any;
      }
    );
  });

  afterEach(() => {
    execResult = undefined;
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('handles success case', () => {
    execResult = [null, 'success', undefined];
    return exec('something', {}).then((result: string | undefined) => {
      expect(result).toBe('success');
    });
  });

  it('handles error case', () => {
    const error: cp.ExecException = new Error('error');
    error.code = 3;
    execResult = [error, 'log message', 'oh no'];
    let succeeded = false;
    return exec('something', {})
      .then(
        () => {
          succeeded = true;
        },
        (result: ExecError) => {
          expect(result.stdout).toBe('log message');
          expect(result.stderr).toBe('oh no');
          expect(result.message).toBe('error');
          expect(result.code).toBe(3);
        }
      )
      .catch(() => {
        // If this fails, it means the promise was resolved not rejected
        expect(succeeded).toBe(false);
      });
  });

  it('pipes stdout', async () => {
    execResult = [null, 'success', undefined];
    await exec('something', { stdout: process.stdout });
    expect(stdoutPipe).toHaveBeenCalled();
    expect(stderrPipe).toHaveBeenCalledTimes(0);
  });

  it('pipes stderr', async () => {
    execResult = [null, 'success', undefined];
    await exec('something', { stderr: process.stderr });
    expect(stderrPipe).toHaveBeenCalled();
    expect(stdoutPipe).toHaveBeenCalledTimes(0);
  });
});
