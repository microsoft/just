import { fail } from 'assert';
import type { TaskFunction } from 'just-task';
import * as path from 'path';
import { getMockScript } from '../../__tests__/getMockScript';
import { MockOutputStream } from '../../__tests__/MockOutputStream';
import * as execModule from '../../utils/exec';
import { nodeExecTask } from '../nodeExecTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedSpawnArgs } from './getNormalizedSpawnArgs';

jest.mock('just-task/lib/logger');

describe('nodeExecTask', () => {
  let stdout: MockOutputStream;
  let stderr: MockOutputStream;
  const realSpawn = execModule.spawn;
  // Spy on spawn to redirect output to the mock streams
  const spawnSpy = jest
    .spyOn(execModule, 'spawn')
    .mockImplementation((cmd, args, opts) => realSpawn(cmd, args, { ...opts, stdio: 'pipe', stdout, stderr }));

  beforeEach(() => {
    stdout = new MockOutputStream();
    stderr = new MockOutputStream();
  });

  afterEach(() => {
    spawnSpy.mockClear();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe.each(['javascript', 'typescript'])('%s', fileType => {
    const ext = fileType !== 'javascript' ? 'ts' : 'js';

    /** Wrap a test that should be successful with extra logging in case it fails */
    async function wrapCallTask(task: TaskFunction, options?: { expectError?: boolean }) {
      try {
        await callTaskForTest(task);
      } catch (error) {
        if (options?.expectError) {
          throw error;
        }
        // Child process failures are really hard to debug without this extra info
        // (it could be because something went wrong with passing options/env)
        fail(
          [
            `Unexpected task failure: ${error}`,
            `options: ${JSON.stringify(spawnSpy.mock.calls[0]?.[2], null, 2)}`,
            'stdout:',
            stdout.getOutput(),
            'stderr:',
            stderr.getOutput(),
          ].join('\n'),
        );
      }
      if (options?.expectError) {
        fail('should have thrown');
      }
    }

    // These tests get expensive due to the IPC, so combine the basic success cases (args, default env)
    it('runs a script', async () => {
      const task = nodeExecTask({
        args: ['--max-old-space-size=4096', getMockScript(`mock-success.${ext}`), '--', 'arg1', 'arg2'],
      });
      await wrapCallTask(task);

      expect(getNormalizedSpawnArgs(spawnSpy)).toEqual([
        '${nodeExecPath}',
        '--max-old-space-size=4096',
        `\${packageRoot}/src/__tests__/mock-success.${ext}`,
        '--',
        'arg1',
        'arg2',
      ]);

      const output = stdout.getOutput();
      expect(output).toContain('hello -- arg1 arg2\n');
      // Full process.env should be passed through to the script by default.
      // Just verify one value we expect to be present.
      expect(process.env.JEST_WORKER_ID).toBeTruthy();
      expect(output).toContain(`JEST_WORKER_ID=${process.env.JEST_WORKER_ID}`);
    });

    it('handles a script that fails', async () => {
      const task = nodeExecTask({
        args: [getMockScript(`mock-fail.${ext}`)],
      });
      try {
        await wrapCallTask(task, { expectError: true });
      } catch (error) {
        expect((error as Error).message).toContain('Command failed');
        expect((error as any).code).toBe(1);
        // in the debugger there are some extra stderr chunks
        expect(stderr.getOutput()).toContain('oh no\n');
      }
    });

    it('passes specified env only', async () => {
      const task = nodeExecTask({
        args: [getMockScript(`mock-success.${ext}`)],
        env: { FOO: 'foo value', BAR: 'bar value' },
      });
      await wrapCallTask(task);

      const output = stdout.getOutput();
      // can't strictly check due to OS-injected values
      expect(output).toContain('FOO=foo value');
      expect(output).toContain('BAR=bar value');
      // verify a value we expect to be present in the current process isn't passed through
      expect(process.env.JEST_WORKER_ID).toBeTruthy();
      expect(output).not.toContain('JEST_WORKER_ID');
    });

    it('errors if file not found', async () => {
      const script = path.join(__dirname, `nope.${ext}`);
      const task = nodeExecTask({
        args: [script],
      });
      try {
        await wrapCallTask(task, { expectError: true });
      } catch (error) {
        expect((error as Error).message).toContain('Command failed');
        expect((error as any).code).toBe(1);
        const output = stderr.getOutput();
        expect(output).toContain('Error: Cannot find module');
      }
    });
  });
});
