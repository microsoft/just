import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import path from 'path';
import {
  copyFilesToDestinationDirectory,
  copyFileToDestinationDirectoryWithRename,
  copyFilesToDestinationDirectoryWithRename,
  copyFilesInDirectory,
  mergeFiles,
  type CopyInstruction,
} from '../CopyInstruction';

describe('CopyInstruction tests', () => {
  const sourceDir = 'sourceDir';
  const destDir = 'dist/lib';

  beforeEach(() => {
    mockfs({
      [sourceDir]: {
        'foo.js': 'foo contents',
        'bar.js': 'bar contents',
        'baz.txt': 'baz contents',
      },
      'files/foo.js': 'foo',
      'my/path/bar.js': 'bar',
      [destDir]: {},
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  describe('copyFilesToDestinationDirectory', () => {
    it('copies files with the same name to the target directory', () => {
      const result = copyFilesToDestinationDirectory({
        sourceFilePaths: ['files/foo.js', 'my/path/bar.js'],
        destinationDirectory: 'dist/lib/',
      });

      expect(result).toEqual([
        { sourceFilePath: path.normalize('files/foo.js'), destinationFilePath: path.normalize('dist/lib/foo.js') },
        { sourceFilePath: path.normalize('my/path/bar.js'), destinationFilePath: path.normalize('dist/lib/bar.js') },
      ]);
    });

    it('accepts a single source file path string', () => {
      const result = copyFilesToDestinationDirectory({
        sourceFilePaths: 'files/foo.js',
        destinationDirectory: 'dist/lib/',
      });

      expect(result).toEqual([
        { sourceFilePath: path.normalize('files/foo.js'), destinationFilePath: path.normalize('dist/lib/foo.js') },
      ]);
    });

    it('propagates the symlink flag onto each instruction', () => {
      const result = copyFilesToDestinationDirectory({
        sourceFilePaths: ['files/foo.js', 'my/path/bar.js'],
        destinationDirectory: 'dist/lib/',
        symlink: true,
      });

      expect(result).toEqual([
        {
          sourceFilePath: path.normalize('files/foo.js'),
          destinationFilePath: path.normalize('dist/lib/foo.js'),
          symlink: true,
        },
        {
          sourceFilePath: path.normalize('my/path/bar.js'),
          destinationFilePath: path.normalize('dist/lib/bar.js'),
          symlink: true,
        },
      ]);
    });
  });

  describe('copyFileToDestinationDirectoryWithRename', () => {
    it('renames a single file into the destination directory', () => {
      const result = copyFileToDestinationDirectoryWithRename({
        sourceFilePath: 'some/path/foo.js',
        destinationName: 'bar.js',
        destinationDirectory: 'dest/target',
      });

      expect(result).toEqual([
        { sourceFilePath: 'some/path/foo.js', destinationFilePath: path.join('dest/target', 'bar.js') },
      ]);
    });

    it('propagates the symlink flag', () => {
      const result = copyFileToDestinationDirectoryWithRename({
        sourceFilePath: 'some/path/foo.js',
        destinationName: 'bar.js',
        destinationDirectory: 'dest/target',
        symlink: true,
      });

      expect(result).toEqual([
        { sourceFilePath: 'some/path/foo.js', destinationFilePath: path.join('dest/target', 'bar.js'), symlink: true },
      ]);
    });
  });

  describe('copyFilesToDestinationDirectoryWithRename', () => {
    it('renames multiple files into the destination directory', () => {
      const result = copyFilesToDestinationDirectoryWithRename({
        files: [
          { sourceFilePath: 'src/foo.js', destinationName: 'foo-renamed.js' },
          { sourceFilePath: 'src/bar.js', destinationName: 'bar-renamed.js' },
        ],
        destinationDirectory: 'dest/target',
      });

      expect(result).toEqual([
        { sourceFilePath: 'src/foo.js', destinationFilePath: path.join('dest/target', 'foo-renamed.js') },
        { sourceFilePath: 'src/bar.js', destinationFilePath: path.join('dest/target', 'bar-renamed.js') },
      ]);
    });

    it('returns an empty array when given no instructions', () => {
      const result = copyFilesToDestinationDirectoryWithRename({
        files: [],
        destinationDirectory: 'dest/target',
      });

      expect(result).toEqual([]);
    });

    it('propagates the symlink flag onto each instruction', () => {
      const result = copyFilesToDestinationDirectoryWithRename({
        files: [
          { sourceFilePath: 'src/foo.js', destinationName: 'foo-renamed.js' },
          { sourceFilePath: 'src/bar.js', destinationName: 'bar-renamed.js' },
        ],
        destinationDirectory: 'dest/target',
        symlink: true,
      });

      expect(result).toEqual([
        {
          sourceFilePath: 'src/foo.js',
          destinationFilePath: path.join('dest/target', 'foo-renamed.js'),
          symlink: true,
        },
        {
          sourceFilePath: 'src/bar.js',
          destinationFilePath: path.join('dest/target', 'bar-renamed.js'),
          symlink: true,
        },
      ]);
    });
  });

  describe('copyFilesInDirectory', () => {
    const sortBySource = (a: CopyInstruction, b: CopyInstruction) =>
      String(a.sourceFilePath).localeCompare(String(b.sourceFilePath));

    it('returns instructions for every file in the source directory', () => {
      const result = copyFilesInDirectory({
        sourceDirectory: sourceDir,
        destinationDirectory: destDir,
      }).sort(sortBySource);

      expect(result).toEqual([
        { sourceFilePath: path.join(sourceDir, 'bar.js'), destinationFilePath: path.join(destDir, 'bar.js') },
        { sourceFilePath: path.join(sourceDir, 'baz.txt'), destinationFilePath: path.join(destDir, 'baz.txt') },
        { sourceFilePath: path.join(sourceDir, 'foo.js'), destinationFilePath: path.join(destDir, 'foo.js') },
      ]);
    });

    it('applies the filter function when provided', () => {
      const result = copyFilesInDirectory({
        sourceDirectory: sourceDir,
        destinationDirectory: destDir,
        filterFunction: file => file.endsWith('.js'),
      }).sort(sortBySource);

      expect(result).toEqual([
        { sourceFilePath: path.join(sourceDir, 'bar.js'), destinationFilePath: path.join(destDir, 'bar.js') },
        { sourceFilePath: path.join(sourceDir, 'foo.js'), destinationFilePath: path.join(destDir, 'foo.js') },
      ]);
    });

    it('propagates the symlink flag onto each instruction', () => {
      const result = copyFilesInDirectory({
        sourceDirectory: sourceDir,
        destinationDirectory: destDir,
        symlink: true,
      }).sort(sortBySource);

      expect(result).toEqual([
        {
          sourceFilePath: path.join(sourceDir, 'bar.js'),
          destinationFilePath: path.join(destDir, 'bar.js'),
          symlink: true,
        },
        {
          sourceFilePath: path.join(sourceDir, 'baz.txt'),
          destinationFilePath: path.join(destDir, 'baz.txt'),
          symlink: true,
        },
        {
          sourceFilePath: path.join(sourceDir, 'foo.js'),
          destinationFilePath: path.join(destDir, 'foo.js'),
          symlink: true,
        },
      ]);
    });

    it('returns an empty array when the filter excludes everything', () => {
      const result = copyFilesInDirectory({
        sourceDirectory: sourceDir,
        destinationDirectory: destDir,
        filterFunction: () => false,
      });

      expect(result).toEqual([]);
    });
  });

  describe('mergeFiles', () => {
    it('returns a single instruction with all source file paths', () => {
      const result = mergeFiles({
        sourceFilePaths: ['a.js', 'b.js', 'c.js'],
        destinationFilePath: 'dest/merged.js',
      });

      expect(result).toEqual({
        sourceFilePath: ['a.js', 'b.js', 'c.js'],
        destinationFilePath: 'dest/merged.js',
      });
    });
  });
});
