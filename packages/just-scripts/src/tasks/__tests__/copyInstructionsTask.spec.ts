import { describe, expect, it, jest, afterEach } from '@jest/globals';
import { copyInstructionsTask } from '../copyInstructionsTask';
import { executeCopyInstructions } from '../../copy/executeCopyInstructions';
import type { CopyConfig } from '../../copy/CopyInstruction';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');
jest.mock('../../copy/executeCopyInstructions');

const mockCopy = (executeCopyInstructions as jest.MockedFunction<typeof executeCopyInstructions>).mockImplementation(
  () => Promise.resolve(),
);

describe('copyInstructionsTask', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to executeCopyInstructions with config', async () => {
    const config: CopyConfig = { copyInstructions: [] };
    const task = copyInstructionsTask(config);
    await callTaskForTest(task);
    expect(mockCopy).toHaveBeenCalledWith(config);
  });

  it('delegates to executeCopyInstructions with undefined config', async () => {
    const task = copyInstructionsTask();
    await callTaskForTest(task);
    expect(mockCopy).toHaveBeenCalledWith(undefined);
  });
});
