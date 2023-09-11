import { join, basename, normalize } from 'path';
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
   * Set to true if a copy or merge should be performed, false if a symlink should be created.
   * If multiple source files are specified (i.e. a merge), this must be true or undefined.
   * The default value of undefined is equivalent to true for a merge, false in all other cases.
   */
  noSymlink?: boolean;
}

export interface CopyConfig {
  copyInstructions: CopyInstruction[];
}

/**
 * Copies files into a destination directory with the same names.
 * For example copyFilesToDestinationDirectory(['some/path/foo.js', 'bar.js'], 'dest/target') would result in the creation of
 * files 'dest/target/foo.js' and 'dest/target/bar.js'.
 */
export function copyFilesToDestinationDirectory(
  sourceFilePaths: string | string[],
  destinationDirectory: string,
  noSymlinks?: boolean,
): CopyInstruction[] {
  return arrayify(sourceFilePaths).map(sourceName => ({
    sourceFilePath: normalize(sourceName),
    destinationFilePath: join(destinationDirectory, basename(sourceName)),
    noSymlink: noSymlinks,
  }));
}

/**
 * Copies a file into a destination directory with a different name.
 * For example copyFileToDestinationDirectoryWithRename('some/path/foo.js', 'bar.js', 'dest/target') would result in the creation of
 * the file 'dest/target/bar.js'.
 */
export function copyFileToDestinationDirectoryWithRename(
  sourceFilePath: string,
  destinationName: string,
  destinationDirectory: string,
  noSymlink?: boolean,
): CopyInstruction[] {
  return [{ sourceFilePath, destinationFilePath: join(destinationDirectory, destinationName), noSymlink }];
}

/**
 * Copies files into a destination directory with different names.
 * For example `copyFilesToDestinationDirectoryWithRename([{sourceFilePath:'some/path/foo.js', destinationName:'bar.js'}], 'dest/target')`
 * would result in the creation of the file 'dest/target/bar.js'.
 */
export function copyFilesToDestinationDirectoryWithRename(
  instrs: { sourceFilePath: string; destinationName: string }[],
  destinationDirectory: string,
  noSymlinks?: boolean,
): CopyInstruction[] {
  return instrs.map(instr => ({
    sourceFilePath: instr.sourceFilePath,
    destinationFilePath: join(destinationDirectory, instr.destinationName),
    noSymlink: noSymlinks,
  }));
}

/**
 * Copies all the files in a directory to the output folder.
 * You can optionally provide a filter function that determines which files to copy.
 */
export function copyFilesInDirectory(
  sourceDirectoryPath: string,
  outputDirectoryPath: string,
  filterFunction?: (file: string) => boolean,
  noSymlinks?: boolean,
): CopyInstruction[] {
  let files = readdirSync(sourceDirectoryPath);

  if (filterFunction) {
    files = files.filter(filterFunction);
  }
  return files.map(file => ({
    sourceFilePath: join(sourceDirectoryPath, file),
    destinationFilePath: join(outputDirectoryPath, file),
    noSymlink: noSymlinks,
  }));
}

/**
 * Merges the contents of multiple files and places them in the output folder.
 * This should only be used for text files and it should not be used for JavaScript
 * files that we care about the sourcemap information since this does not merge sourcemaps.
 */
export function mergeFiles(sourceFilePaths: string[], destinationFilePath: string): CopyInstruction {
  return {
    sourceFilePath: sourceFilePaths,
    destinationFilePath,
  };
}
