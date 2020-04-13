import { dirname } from 'path';
import { readFile, writeFile, copy, ensureDir } from 'fs-extra';
import { CopyInstruction, CopyConfig } from './CopyInstruction';
import { arrayify } from '../arrayUtils/arrayify';
import { uniqueValues } from '../arrayUtils/uniqueValues';

/**
 * Function containing the core code for the copy task with a given config.
 */
export async function executeCopyInstructions(config: CopyConfig | undefined) {
  if (config && config.copyInstructions) {
    await createDirectories(config.copyInstructions);
    await Promise.all(config.copyInstructions.map(executeSingleCopyInstruction));
  }
}

function createDirectories(copyInstructions: CopyInstruction[]) {
  return Promise.all(
    uniqueValues(copyInstructions.map(instruction => dirname(instruction.destinationFilePath))).map(dirname => ensureDir(dirname))
  );
}

function executeSingleCopyInstruction(copyInstruction: CopyInstruction) {
  const sourceFileNames = arrayify(copyInstruction.sourceFilePath);

  // source and dest are 1-to-1?  perform binary copy.
  if (sourceFileNames.length === 1) {
    return copy(sourceFileNames[0], copyInstruction.destinationFilePath);
  }

  // perform text merge operation.
  return Promise.all(sourceFileNames.map(fileName => readFile(fileName))).then(fileContents => {
    return writeFile(copyInstruction.destinationFilePath, fileContents.join('\n'));
  });
}
