import { executeCopyInstructions } from '../copy/executeCopyInstructions';
import { CopyConfig } from '../copy/CopyInstruction';
import { TaskFunction } from 'just-task';

/**
 * This is an advanced copy task that allows more advanced usage beyond simple copies.
 * It allows for copy renames. It takes in a config that can be generated dynamically with code at build time.
 *
 * @param config Copy instructions configuration
 */
export function copyInstructionsTask(config?: CopyConfig): TaskFunction {
  return function copyInstructions() {
    return executeCopyInstructions(config);
  };
}
