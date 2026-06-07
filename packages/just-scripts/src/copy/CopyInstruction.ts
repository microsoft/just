import path from 'path';
import { readdirSync } from 'fs';
import { arrayify } from '../arrayUtils/arrayify';

export interface CopyInstruction {
  /**
   * The path+filename of the source files. If more than one file is provided, the files will be merged in order
   * and output to a file in the destination path.
   */
  sourceFilePath: string | string[];

  /**
   * The path+filename of the destination file.
   */
  destinationFilePath: string;

  /**
   * Set to true to create symlinks rather than copying (the default is to copy).
   *
   * In the case of a file merge, this must be false or unset.
   */
  symlink?: boolean;
}

export interface CopyConfig {
  copyInstructions: CopyInstruction[];
}

/**
 * Copies files into a destination directory with the same names.
 * @example
 * ```ts
 * // Creates files dest/target/foo.js and dest/target/bar.js
 * copyFilesToDestinationDirectory({
 *   sourceFilePaths: ['some/path/foo.js', 'bar.js'],
 *   destinationDirectory: 'dest/target'
 * });
 * ```
 */
export function copyFilesToDestinationDirectory(
  params: Pick<CopyInstruction, 'symlink'> & {
    sourceFilePaths: string | string[];
    destinationDirectory: string;
  },
): CopyInstruction[] {
  const { sourceFilePaths, destinationDirectory, symlink } = params;
  return arrayify(sourceFilePaths).map(sourceName => ({
    sourceFilePath: path.normalize(sourceName),
    destinationFilePath: path.join(destinationDirectory, path.basename(sourceName)),
    symlink,
  }));
}

/**
 * Copies a file into a destination directory with a different name.
 * @example
 * ```ts
 * // Creates file dest/target/bar.js
 * copyFileToDestinationDirectoryWithRename({
 *   sourceFilePath: 'some/path/foo.js',
 *   destinationName: 'bar.js',
 *   destinationDirectory: 'dest/target'
 * });
 * ```
 */
export function copyFileToDestinationDirectoryWithRename(
  params: Pick<CopyInstruction, 'symlink'> & {
    sourceFilePath: string;
    destinationName: string;
    destinationDirectory: string;
  },
): CopyInstruction[] {
  const { sourceFilePath, destinationName, destinationDirectory, symlink } = params;
  return [{ sourceFilePath, destinationFilePath: path.join(destinationDirectory, destinationName), symlink }];
}

/**
 * Copies files into a destination directory with different names.
 * @example
 * ```ts
 * // Creates file dest/target/bar.js
 * copyFilesToDestinationDirectoryWithRename({
 *   files: [{ sourceFilePath: 'some/path/foo.js', destinationName: 'bar.js' }],
 *   destinationDirectory: 'dest/target'
 * });
 * ```
 */
export function copyFilesToDestinationDirectoryWithRename(
  params: Pick<CopyInstruction, 'symlink'> & {
    files: { sourceFilePath: string; destinationName: string }[];
    destinationDirectory: string;
  },
): CopyInstruction[] {
  const { files, destinationDirectory, symlink } = params;
  return files.map(instr => ({
    sourceFilePath: instr.sourceFilePath,
    destinationFilePath: path.join(destinationDirectory, instr.destinationName),
    symlink,
  }));
}

/**
 * Copies all the files in a directory to the output folder.
 * You can optionally provide a filter function that determines which files to copy.
 */
export function copyFilesInDirectory(
  params: Pick<CopyInstruction, 'symlink'> & {
    sourceDirectory: string;
    destinationDirectory: string;
    filterFunction?: (file: string) => boolean;
  },
): CopyInstruction[] {
  const { sourceDirectory, destinationDirectory, filterFunction, symlink } = params;
  let files = readdirSync(sourceDirectory);

  if (filterFunction) {
    files = files.filter(filterFunction);
  }
  return files.map(file => ({
    sourceFilePath: path.join(sourceDirectory, file),
    destinationFilePath: path.join(destinationDirectory, file),
    symlink,
  }));
}

/**
 * Merges the contents of multiple files and places them in the output folder.
 * This should only be used for text files and it should not be used for JavaScript
 * files that we care about the sourcemap information since this does not merge sourcemaps.
 */
export function mergeFiles(params: { sourceFilePaths: string[]; destinationFilePath: string }): CopyInstruction {
  const { sourceFilePaths, destinationFilePath } = params;
  return {
    sourceFilePath: sourceFilePaths,
    destinationFilePath,
  };
}
