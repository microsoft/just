import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { resolve } from 'just-task';
import { esbuildTask, type EsbuildBuildOptions } from '../esbuildTask';
import { callTaskForTest } from './callTaskForTest';

const mockBuild = jest.fn(_args => Promise.resolve({}));

// Mock resolve to control esbuild module resolution
jest.mock('just-task', () => {
  const actual = jest.requireActual<typeof import('just-task')>('just-task');
  return {
    ...actual,
    resolve: jest.fn((name: string) => {
      if (name === 'esbuild') return 'esbuild';
      return actual.resolve(name);
    }),
  };
});
jest.mock('just-task/lib/logger');

// Mock the esbuild module that will be require()'d at runtime
jest.mock('esbuild', () => ({ build: mockBuild }));

describe('esbuildTask (mocked)', () => {
  const mockResolve = resolve as jest.MockedFunction<typeof resolve>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws if esbuild is not resolved', () => {
    mockResolve.mockReturnValueOnce(null);
    expect(() => esbuildTask()).toThrow('cannot find esbuild');
  });

  it('calls esbuild.build with provided options', async () => {
    const options: EsbuildBuildOptions = { entryPoints: ['src/index.ts'], bundle: true, outdir: 'dist' };
    const task = esbuildTask(options);
    await callTaskForTest(task);
    expect(mockBuild).toHaveBeenCalledWith(options);
  });

  it('calls esbuild.build with empty options by default', async () => {
    const task = esbuildTask();
    await callTaskForTest(task);
    expect(mockBuild).toHaveBeenCalledWith({});
  });
});
