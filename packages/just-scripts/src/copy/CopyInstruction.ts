import { join, basename, normalize } from 'path';
import { readdirSync, statSync, existsSync } from 'fs';
import { arrayify } from './arrayify';

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
}

export interface CopyConfig {
  copyInstructions: CopyInstruction[];
}

export interface LocalizedFileInfo {
  /**
   * The base path of where the localized files are located.
   */
  baseDirectory: string;

  /**
   * The name of the localized file to be copied, without extension (.js or .min.js will be added).
   */
  baseFileName: string;
}

/**
 * Copies files into a destination directory with the same names.
 * For example copyFilesToDestinationDirectory(['some/path/foo.js', 'bar.js'], 'dest/target') would result in the creation of
 * files 'dest/target/foo.js' and 'dest/target/bar.js'.
 */
export function copyFilesToDestinationDirectory(sourceFilePaths: string | string[], destinationDirectory: string): CopyInstruction[] {
  return arrayify(sourceFilePaths).map(sourceName => ({
    sourceFilePath: normalize(sourceName),
    destinationFilePath: join(destinationDirectory, basename(sourceName))
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
  destinationDirectory: string
): CopyInstruction[] {
  return [{ sourceFilePath, destinationFilePath: join(destinationDirectory, destinationName) }];
}

/**
 * Copies files into a destination directory with different names.
 * For example copyFilesToDestinationDirectoryWithRename([{sourceFilePath:'some/path/foo.js', destinationName:'bar.js'}], 'dest/target')
 * would result in the creation of the file 'dest/target/bar.js'.
 */
export function copyFilesToDestinationDirectoryWithRename(
  instrs: { sourceFilePath: string; destinationName: string }[],
  destinationDirectory: string
): CopyInstruction[] {
  return instrs.map(instr => ({
    sourceFilePath: instr.sourceFilePath,
    destinationFilePath: join(destinationDirectory, instr.destinationName)
  }));
}

/** Given the template source folder and filename, iterates in the source folder for all subfolders (assumed to be locales)
 * and copies contained files with the given base name to the <baseDestPath>/<locale> folder.
 * srcBasePath example: 'node_modules/@ms/word-online-ux/node_modules/@ms/word-online-icons/dist'
 * baseJsFilename example: 'word-ribbon-sprite' will copy 'word-ribbon-sprite.js' and 'word-ribbon-sprite.min.js'
 * baseDestPath example: 'dist/localization'
 */
export function copyLocalizedDirectory(srcBasePath: string, baseJsFilename: string, baseDestPath: string): CopyInstruction[] {
  const result: CopyInstruction[] = [];

  const locales = getLocalesFromReferenceFolder(srcBasePath);

  locales.forEach((locale: string) => {
    result.push(
      ...copyFilesToDestinationDirectory(
        [join(srcBasePath, locale, baseJsFilename + '.js'), join(srcBasePath, locale, baseJsFilename + '.min.js')],
        join(baseDestPath, locale)
      )
    );
  });

  return result;
}

/**
 * Copies all the files in a directory to the output folder.
 * You can optionally provide a filter function that determines which files to copy.
 */
export function copyFilesInDirectory(
  sourceDirectoryPath: string,
  outputDirectoryPath: string,
  filterFunction?: (file: string) => boolean
): CopyInstruction[] {
  let files = readdirSync(sourceDirectoryPath);

  if (filterFunction) {
    files = files.filter(filterFunction);
  }
  return files.map(file => ({
    sourceFilePath: join(sourceDirectoryPath, file),
    destinationFilePath: join(outputDirectoryPath, file)
  }));
}

/**
 * Merges the contents of the localized string and localized icons Javascript files
 * iconFallbackLocale is the fallback locale to use if the current process string path doesn't
 * contain an equivalent localized icon path.  By default with the fallback locale is en-us.
 * This method handles both debug and ship version of the js files (.js and .min.js).
 */
export function mergeLocalizedFilesWithFallback(
  sourceStringsFileInfo: LocalizedFileInfo | LocalizedFileInfo[],
  sourceIconsFileInfo: LocalizedFileInfo | LocalizedFileInfo[],
  destinationFileInfo: LocalizedFileInfo,
  iconFallbackLocale?: string
): CopyInstruction[] {
  const result: CopyInstruction[] = [];

  const _sourceStringsFileInfo = arrayify(sourceStringsFileInfo);
  const _sourceIconsFileInfo = arrayify(sourceIconsFileInfo);

  if (!_sourceStringsFileInfo.length) {
    return []; // must have at least one string file to key locales off of
  }
  const locales = getLocalesFromReferenceFolder(_sourceStringsFileInfo[0].baseDirectory);

  locales.forEach((locale: string) => {
    ['.js', '.min.js'].forEach(ext => {
      const mergeSourceFiles: string[] = [
        ..._sourceStringsFileInfo.map(fi => join(fi.baseDirectory, locale, fi.baseFileName + ext)),
        ..._sourceIconsFileInfo.map(fi => {
          let iconBase = join(fi.baseDirectory, locale);
          if (!existsSync(iconBase)) {
            iconBase = join(fi.baseDirectory, iconFallbackLocale || 'en-us');
          }
          return join(iconBase, fi.baseFileName + ext);
        })
      ];

      const destFile = join(destinationFileInfo.baseDirectory, locale, destinationFileInfo.baseFileName + ext);
      result.push(mergeFiles(mergeSourceFiles, destFile));
    });
  });
  return result;
}

/**
 * Merges the contents of multiple files and places them in the output folder.
 * This should only be used for text files and it should not be used for JavaScript
 * files that we care about the sourcemap information since this does not merge sourcemaps.
 */
export function mergeFiles(sourceFilePaths: string[], destinationFilePath: string): CopyInstruction {
  return {
    sourceFilePath: sourceFilePaths,
    destinationFilePath
  };
}

function existingPathIsDirectory(filePath: string, locale: string, exclusions: string[]): Boolean {
  return statSync(join(filePath, locale)).isDirectory() && exclusions.indexOf(locale) < 0;
}

function getLocalesFromReferenceFolder(folderPath: string): string[] {
  return readdirSync(folderPath).filter((locale: string) => existingPathIsDirectory(folderPath, locale, ['lib']));
}
