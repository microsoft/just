import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { fail } from 'assert';
import type nanoSpawnType from 'nano-spawn';
import type { Result as SpawnResult, SubprocessError } from 'nano-spawn';
import type { TaskFunction } from 'just-task';
import path from 'path';
import { getMockScript } from '../../__tests__/getMockScript';
import { nodeExecTask, type NodeExecTaskOptions } from '../nodeExecTask';
import { callTaskForTest } from './callTaskForTest';
import { normalizeArgs } from './getNormalizedSpawnArgs';

jest.mock('just-task/lib/logger');

describe('nodeExecTask', () => {
  // It's hard to access the nano-spawn result by normal jest methods, so capture it manually here
  let lastResult: SpawnResult | undefined;
  let nanoSpawn: jest.MockedFunction<typeof nanoSpawnType>;

  beforeAll(async () => {
    // Set up the mock here as a workaround for lack of top-level async import support
    const realNanoSpawn = await import('nano-spawn');
    jest.resetModules();

    jest.unstable_mockModule('nano-spawn', () => {
      const mocked = jest.fn(async (...args) => {
        // @ts-expect-error -- spreading all provided args is valid here
        lastResult = await realNanoSpawn.default(...args);
        return lastResult;
      });
      return { __esModule: true, ...realNanoSpawn, default: mocked };
    });
    nanoSpawn = (await import('nano-spawn')).default as jest.MockedFunction<typeof nanoSpawnType>;
  });

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
        // with nano-spawn this should be an informative error
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

      expect(nanoSpawn).toHaveBeenCalledTimes(1);
      const [program, args] = nanoSpawn.mock.calls[0];
      expect(program).toBe(process.execPath);
      expect(normalizeArgs(args as string[])).toEqual([
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
      const error = await wrapCallTask(task, { expectError: true }).catch(err => err as SubprocessError);
      expect(error).toMatchObject({
        message: expect.stringContaining('Command failed'),
        exitCode: 1,
        // in the debugger there are some extra stderr chunks
        stderr: expect.stringContaining('oh no'),
      });
    });

    it('merges env', async () => {
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
      expect(process.env.JEST_WORKER_ID).toBeTruthy();
      expect(output).toContain('JEST_WORKER_ID');

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
      const error = await wrapCallTask(task, { expectError: true }).catch(err => err as SubprocessError);
      expect(error).toMatchObject({
        message: expect.stringContaining('Command failed'),
        exitCode: 1,
        stderr: expect.stringContaining('Error: Cannot find module'),
      });
    });
  });
});
