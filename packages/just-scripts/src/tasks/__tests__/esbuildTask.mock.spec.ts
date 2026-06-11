import { describe, expect, it, jest } from '@jest/globals';
import { esbuildTask, type EsbuildBuildOptions } from '../esbuildTask';
import { callTaskForTest } from './callTaskForTest';
import { tryRequire } from '../../tryRequire';

jest.mock('just-task/lib/logger');

const mockBuild = jest.fn(_args => Promise.resolve({}));

jest.mock('../../tryRequire', () => ({
  tryRequire: jest.fn((name: string) => {
    if (name === 'esbuild') return { build: mockBuild };
    return null;
  }),
}));
const mockTryRequire = tryRequire as jest.MockedFunction<typeof tryRequire>;

describe('esbuildTask (mocked)', () => {
  it('throws if esbuild is not resolved', async () => {
    mockTryRequire.mockReturnValueOnce(null);
    const task = esbuildTask();
    await expect(callTaskForTest(task)).rejects.toThrow('Cannot find esbuild');
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
