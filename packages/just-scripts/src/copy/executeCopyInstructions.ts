import { dirname, resolve } from 'path';
import { readFile, writeFile, copy, ensureDir, ensureSymlink } from 'fs-extra';
import { CopyInstruction, CopyConfig } from './CopyInstruction';
import { arrayify } from '../arrayUtils/arrayify';

/**
 * Function containing the core code for the copy task with a given config.
 */
export async function executeCopyInstructions(config: CopyConfig | undefined): Promise<void> {
  if (config && config.copyInstructions) {
    validateConfig(config.copyInstructions);
    await createDirectories(config.copyInstructions);
    await Promise.all(config.copyInstructions.map(executeSingleCopyInstruction));
  }
}

function validateConfig(copyInstructions: CopyInstruction[]) {
  copyInstructions.forEach(instr => {
    if (instr.symlink && Array.isArray(instr.sourceFilePath) && instr.sourceFilePath.length > 1) {
      throw new Error('Multiple source files cannot be specified when making a symlink');
    }
  });
}

function createDirectories(copyInstructions: CopyInstruction[]) {
  const directories = new Set(copyInstructions.map(instruction => dirname(instruction.destinationFilePath)));
  return Promise.all([...directories].map(dirname => ensureDir(dirname)));
}

async function executeSingleCopyInstruction(copyInstruction: CopyInstruction) {
  const sourceFileNames = arrayify(copyInstruction.sourceFilePath);

  // source and dest are 1-to-1?  perform binary copy or symlink as desired.
  if (sourceFileNames.length === 1) {
    if (copyInstruction.symlink) {
      return ensureSymlink(resolve(sourceFileNames[0]), copyInstruction.destinationFilePath);
    }
    return copy(sourceFileNames[0], copyInstruction.destinationFilePath);
  }

  // perform text merge operation.
  const sourceFiles = await Promise.all(sourceFileNames.map(fileName => readFile(fileName)));
  return writeFile(copyInstruction.destinationFilePath, sourceFiles.join('\n'));
}
