import { describe, expect, it, jest, afterEach } from '@jest/globals';
import * as fse from 'fs-extra';
import { cleanTask, defaultCleanPaths } from '../cleanTask';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');

// Mock fse.remove to track calls without actual filesystem operations
jest.mock('fs-extra', () => ({
  remove: jest.fn((_path: string, cb: any) => {
    cb(null);
    return Promise.resolve();
  }),
}));
const removeSpy = fse.remove as jest.MockedFunction<typeof fse.remove>;

// Mock clearCache from just-task
jest.mock('just-task', () => {
  const actual = jest.requireActual<typeof import('just-task')>('just-task');
  return { ...actual, clearCache: jest.fn() };
});

describe('cleanTask', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('removes default paths', async () => {
    const task = cleanTask();
    await callTaskForTest(task);
    const removedPaths = removeSpy.mock.calls.map(call => call[0]);
    expect(removedPaths).toEqual(defaultCleanPaths());
  });

  it('removes specified paths', async () => {
    const task = cleanTask({ paths: ['build', 'output'] });
    await callTaskForTest(task);
    const removedPaths = removeSpy.mock.calls.map(call => call[0]);
    expect(removedPaths).toEqual(['build', 'output']);
  });

  it('accepts paths as first argument (deprecated)', async () => {
    const task = cleanTask(['custom-lib', 'custom-dist']);
    await callTaskForTest(task);
    const removedPaths = removeSpy.mock.calls.map(call => call[0]);
    expect(removedPaths).toEqual(['custom-lib', 'custom-dist']);
  });
});
