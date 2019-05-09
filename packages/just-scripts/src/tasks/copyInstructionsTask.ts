import { executeCopyInstructions } from '../copy/executeCopyInstructions';
import { CopyConfig } from '../copy/CopyInstruction';

export function copyInstructionsTask(config?: CopyConfig) {
  return function copyInstructions() {
    return executeCopyInstructions(config);
  };
}
