import * as mockfs from 'mock-fs';
import * as path from 'path';
import * as fs from 'fs';
// import { dirSync, fileSync, DirResult, FileResult } from 'tmp';
import { executeCopyInstructions } from '../executeCopyInstructions';
import { CopyInstruction } from '../CopyInstruction';

describe('executeCopyInstructions functional tests', () => {
  const sourceDir = 'sourceDir';
  const sourceFile1 = 'sourceFile1';
  const sourceFile2 = 'sourceFile2';
  const sourceFilePath1 = path.join(sourceDir, sourceFile1);
  const sourceFilePath2 = path.join(sourceDir, sourceFile2);
  const sourceFileContents1 = 'source file contents 1';
  const sourceFileContents2 = 'source file contents 2';
  const destDir = 'destDir';
  const destFile = 'destFile';
  const destFilePath = path.join(destDir, destFile);

  beforeEach(() => {
    mockfs({
      [sourceDir]: {
        [sourceFile1]: sourceFileContents1,
        [sourceFile2]: sourceFileContents2,
      },
      [destDir]: {},
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('executes single source copy instructions (symlink)', async () => {
    const copyInstruction: CopyInstruction = {
      sourceFilePath: sourceFilePath1,
      destinationFilePath: destFilePath,
    };

    expect(fs.existsSync(destFilePath)).toBeFalsy();

    await executeCopyInstructions({
      copyInstructions: [copyInstruction],
    });

    expect(fs.existsSync(destFilePath)).toBeTruthy();
    expect(fs.lstatSync(destFilePath).isSymbolicLink()).toBeTruthy();
    expect(fs.readFileSync(destFilePath).toString()).toEqual(sourceFileContents1);
  });

  it('executes single source (arrayified) copy instructions (copy)', async () => {
    const copyInstruction: CopyInstruction = {
      sourceFilePath: [sourceFilePath1],
      destinationFilePath: destFilePath,
      noSymlink: true,
    };

    expect(fs.existsSync(destFilePath)).toBeFalsy();

    await executeCopyInstructions({
      copyInstructions: [copyInstruction],
    });

    expect(fs.existsSync(destFilePath)).toBeTruthy();
    expect(fs.lstatSync(destFilePath).isSymbolicLink()).toBeFalsy();
    expect(fs.readFileSync(destFilePath).toString()).toEqual(sourceFileContents1);
  });

  it('merges output', async () => {
    const copyInstruction: CopyInstruction = {
      sourceFilePath: [sourceFilePath1, sourceFilePath2],
      destinationFilePath: destFilePath,
    };

    const expectedOutput = [sourceFileContents1, sourceFileContents2].join('\n');

    expect(fs.existsSync(destFilePath)).toBeFalsy();

    await executeCopyInstructions({
      copyInstructions: [copyInstruction],
    });

    expect(fs.existsSync(destFilePath)).toBeTruthy();
    expect(fs.lstatSync(destFilePath).isSymbolicLink()).toBeFalsy();
    expect(fs.readFileSync(destFilePath).toString()).toEqual(expectedOutput);
  });

  it('fails to validate merge + symlink copy instruction', async () => {
    const copyInstruction: CopyInstruction = {
      sourceFilePath: [sourceFilePath1, sourceFilePath2],
      destinationFilePath: destFilePath,
      noSymlink: false,
    };

    const promise = executeCopyInstructions({
      copyInstructions: [copyInstruction],
    });

    await expect(promise).rejects.toThrow();
  });

  /**
   * TODO:
   * Rationalize and document expected executeCopyInstructions behavior.
   * If same source is present twice to same dest file, do we really want output duplicated?
   * Fix / change these tests so that they pass after updating code / documentation on expected behavior.
   */
  // it('does not duplicate output from duplicate source files', async () => {
  //   const copyInstruction = {
  //     sourceFilePath: [sourceFilePath, sourceFilePath],
  //     destinationFilePath: destFilePath
  //   };

  //   expect(fs.existsSync(destFilePath)).toBeFalsy();

  //   await executeCopyInstructions({
  //     copyInstructions: [
  //       copyInstruction
  //     ]
  //   });

  //   expect(fs.existsSync(destFilePath)).toBeTruthy();
  //   expect(fs.readFileSync(destFilePath).toString()).toEqual(sourceFileContents1);
  // });
});

// These tests test scenarios where multiple instructions end up deleting and overwriting the same
// filepath multiple times. They are commented out because they currently fail, generating ENOENT and
// EBUSY exceptions. We may want just to handle these types of conditions eventually, most
// likely by having an optional validation step. Documentation should also be added to executeCopyInstructions
// detailing caution and error scenarios.
// These tests require 'tmp' and '@types/tmp` dev dependencies.
// describe('executeCopyInstructions I/O exception tests', () => {
//   let destDir: DirResult;
//   let sourceFile: FileResult;
//   let sourceNames: string[] = [];

//   beforeEach(() => {
//     // unsafeCleanup will clean up directories even when not empty
//     destDir = dirSync({ unsafeCleanup: true });
//     sourceFile = fileSync();
//   });

//   afterEach(() => {
//     sourceNames.forEach(name => {
//       if (fs.existsSync(name)) {
//         fs.unlinkSync(name);
//       }
//     })
//     destDir.removeCallback();
//     sourceFile.removeCallback();
//   });

//   it('copies duplicate sources to empty dest without generating an exception', async () => {
//     const basename = path.basename(sourceFile.name);
//     const destinationFilePath = path.join(destDir.name, basename);

//     const copyInstruction = {
//       sourceFilePath: sourceFile.name,
//       destinationFilePath
//     };

//     // Unchecked duplicate copy instructions will cause an EBUSY: resource busy or locked
//     // as the copy instructions attempt to write to the same file.
//     await executeCopyInstructions({
//       copyInstructions: Array(100).fill(copyInstruction)
//     });
//   });

//   it('copies duplicate sources to dest with pre-existing file without generating an exception', async () => {
//     const basename = path.basename(sourceFile.name);
//     const destinationFilePath = path.join(destDir.name, basename);

//     const copyInstruction = {
//       sourceFilePath: sourceFile.name,
//       destinationFilePath
//     };

//     // Set up "pre-existing" file in dest first
//     await executeCopyInstructions({
//       copyInstructions: [
//         copyInstruction,
//       ]
//     });

//     // If file already exists, unchecked duplicate copy instructions will attempt to delete the file
//     // when overwriting it, generating an ENOENT: no such file or directory error.
//     await executeCopyInstructions({
//       copyInstructions: Array(100).fill(copyInstruction)
//     });
//   });
// });
