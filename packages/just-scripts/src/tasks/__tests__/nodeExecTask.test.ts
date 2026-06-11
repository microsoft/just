import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fail } from 'assert';
import execa from 'execa';
import type { TaskFunction } from 'just-task';
import path from 'path';
import { getMockScript } from '../../__tests__/getMockScript';
import { nodeExecTask, type NodeExecTaskOptions } from '../nodeExecTask';
import { callTaskForTest } from './callTaskForTest';
import { getNormalizedExecArgs } from './getNormalizedExecArgs';

jest.mock('just-task/lib/logger');

// It's hard to access the execa result by normal jest methods, so capture it manually here
let lastResult: execa.ExecaReturnValue | undefined;
jest.mock('execa', () => {
  const actual = jest.requireActual<typeof execa>('execa');
  const mocked = jest.fn(async (...args) => {
    // @ts-expect-error -- spreading all provided args is valid here
    lastResult = await actual(...args);
    return lastResult;
  });
  return Object.assign(mocked, actual);
});
const execaSpy = execa as unknown as jest.MockedFunction<typeof execa>;

describe('nodeExecTask', () => {
  afterEach(() => {
    lastResult = undefined;
  });

  describe.each(['javascript', 'typescript (ts-node)'])('%s', fileType => {
    const isTS = fileType !== 'javascript';
    const ext = isTS ? 'ts' : 'js';
    const maybeTsAutoArgs = isTS ? ['-r', '${repoRoot}/node_modules/ts-node/register/index.js'] : [];

    /** Include appropriate TypeScript options with the task if needed */
    function wrapNodeExecTask(options: NodeExecTaskOptions) {
      return nodeExecTask({
        ...(isTS && { enableTypeScript: true, transpileOnly: true }),
        ...options,
        spawnOptions: { ...options.spawnOptions, stdio: 'pipe' },
      });
    }

    /** Wrap a test that should be successful with extra logging in case it fails */
    async function wrapCallTask(task: TaskFunction, options?: { expectError?: boolean }) {
      try {
        await callTaskForTest(task);
      } catch (error) {
        if (options?.expectError) {
          throw error;
        }
        // with execa this should be an informative error
        expect(error).toBeUndefined();
      }
      if (options?.expectError) {
        fail('should have thrown');
      }
    }

    // These tests get expensive due to the IPC and especially with ts-node, so combine the basic
    // success cases (args, default env)
    it('runs a script', async () => {
      const task = wrapNodeExecTask({
        args: ['--max-old-space-size=4096', getMockScript(`mock-success.${ext}`), '--', 'arg1', 'arg2'],
      });
      await wrapCallTask(task);

      expect(getNormalizedExecArgs(execaSpy)[0]).toEqual([
        '${nodeExecPath}',
        ...maybeTsAutoArgs,
        '--max-old-space-size=4096',
        `\${packageRoot}/src/__tests__/mock-success.${ext}`,
        '--',
        'arg1',
        'arg2',
      ]);

      expect(lastResult).toBeTruthy();
      const output = lastResult?.stdout;
      expect(output).toContain('hello -- arg1 arg2\n');
      // Full process.env should be passed through to the script by default.
      // Just verify one value we expect to be present.
      expect(process.env.JEST_WORKER_ID).toBeTruthy();
      expect(output).toContain(`JEST_WORKER_ID=${process.env.JEST_WORKER_ID}`);

      if (isTS) {
        expect(output).toContain('TS_NODE_');
      } else {
        expect(output).not.toContain('TS_NODE_');
      }
    });

    it('handles a script that fails', async () => {
      const task = wrapNodeExecTask({
        args: [getMockScript(`mock-fail.${ext}`)],
      });
      const error = await wrapCallTask(task, { expectError: true }).catch(err => err as execa.ExecaError);
      expect(error).toMatchObject({
        message: expect.stringContaining('Command failed'),
        exitCode: 1,
        // in the debugger there are some extra stderr chunks
        stderr: expect.stringContaining('oh no'),
      });
    });

    it('passes specified env only', async () => {
      const task = wrapNodeExecTask({
        args: [getMockScript(`mock-success.${ext}`)],
        env: { FOO: 'foo value', BAR: 'bar value' },
      });
      await wrapCallTask(task);

      expect(lastResult).toBeTruthy();
      const output = lastResult?.stdout;
      // can't strictly check due to OS-injected values
      expect(output).toContain('FOO=foo value');
      expect(output).toContain('BAR=bar value');
      // verify a value we expect to be present in the current process isn't passed through
      expect(process.env.JEST_WORKER_ID).toBeTruthy();
      expect(output).not.toContain('JEST_WORKER_ID');

      // In TS it would have failed if these were missed, but check anyway
      if (isTS) {
        expect(output).toContain('TS_NODE_');
      } else {
        expect(output).not.toContain('TS_NODE_');
      }
    });

    it('errors if file not found', async () => {
      const script = path.join(__dirname, `nope.${ext}`);
      const task = wrapNodeExecTask({
        args: [script],
      });
      const error = await wrapCallTask(task, { expectError: true }).catch(err => err as execa.ExecaError);
      expect(error).toMatchObject({
        message: expect.stringContaining('Command failed'),
        exitCode: 1,
        stderr: expect.stringContaining('Error: Cannot find module'),
      });
    });
  });
});
