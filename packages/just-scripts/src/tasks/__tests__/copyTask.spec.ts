import { describe, expect, it, jest, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import fse from 'fs-extra';
import { copyTask } from '../copyTask';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');

// Backslashes are only path separators on Windows; elsewhere they're literal filename characters,
// so the literal-path normalization only applies there.
// eslint-disable-next-line no-restricted-properties
const itWindows = process.platform === 'win32' ? it : it.skip;

describe('copyTask', () => {
  afterEach(() => {
    mockfs.restore();
  });

  it('copies files to destination directory', async () => {
    mockfs({
      'src/file1.txt': 'content1',
      'src/file2.txt': 'content2',
    });
    const task = copyTask({ paths: ['src/file1.txt', 'src/file2.txt'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/file1.txt')).toBe(true);
    expect(fse.existsSync('out/file2.txt')).toBe(true);
  });

  it('copies files matching glob patterns', async () => {
    mockfs({
      'src/a.ts': 'a',
      'src/b.ts': 'b',
      'src/c.js': 'c',
    });
    const task = copyTask({ paths: ['src/*.ts'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/a.ts')).toBe(true);
    expect(fse.existsSync('out/b.ts')).toBe(true);
    expect(fse.existsSync('out/c.js')).toBe(false);
  });

  it('recursively copies directory contents, preserving nested structure', async () => {
    mockfs({
      'src/a.txt': 'a',
      'src/sub/b.txt': 'b',
      'src/sub/deep/c.txt': 'c',
    });
    const task = copyTask({ paths: ['src'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/a.txt')).toBe(true);
    expect(fse.existsSync('out/sub/b.txt')).toBe(true);
    expect(fse.existsSync('out/sub/deep/c.txt')).toBe(true);
  });

  it('copies files matching a globstar pattern', async () => {
    mockfs({
      'src/a.txt': 'a',
      'src/sub/b.txt': 'b',
      'src/sub/deep/c.txt': 'c',
      'src/sub/d.js': 'd',
    });
    const task = copyTask({ paths: ['src/**/*.txt'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/a.txt')).toBe(true);
    expect(fse.existsSync('out/sub/b.txt')).toBe(true);
    expect(fse.existsSync('out/sub/deep/c.txt')).toBe(true);
    expect(fse.existsSync('out/sub/d.js')).toBe(false);
  });

  itWindows('normalizes backslash separators in literal (non-glob) paths', async () => {
    mockfs({
      'src/sub/file.txt': 'content',
    });
    // A literal Windows-style path: glob would treat the `\` as escapes, but since this path exists
    // as-is, copyTask normalizes the separators to `/` before matching.
    const task = copyTask({ paths: ['src\\sub\\file.txt'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/file.txt')).toBe(true);
  });

  it('creates destination directory if it does not exist', async () => {
    mockfs({
      'src/file.txt': 'content',
    });
    const task = copyTask({ paths: ['src/file.txt'], dest: 'nested/output/dir' });
    await callTaskForTest(task);
    expect(fse.existsSync('nested/output/dir/file.txt')).toBe(true);
  });
});
