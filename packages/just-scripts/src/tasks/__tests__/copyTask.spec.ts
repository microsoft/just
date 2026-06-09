import { describe, expect, it, jest, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import fse from 'fs-extra';
import { Readable } from 'stream';
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
    // a couple tests mock additional functions
    jest.restoreAllMocks();
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
    // Literal file paths are copied directly into `dest` without recreating their source directory.
    expect(fse.existsSync('out/src')).toBe(false);
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

  it('does not copy a file more than once for a recursive (**) pattern', async () => {
    mockfs({
      'src/a.txt': 'a',
      'src/sub/b.txt': 'b',
      'src/sub/deep/c.txt': 'c',
    });
    // A `**` pattern matches both files and their intermediate directories. Recursing into those
    // matched directories must not re-enqueue files that the pattern already matched, otherwise the
    // same destination is written multiple times concurrently (wasteful and a corruption race).
    const writtenDestinations: string[] = [];
    const realCreateWriteStream = fse.createWriteStream;
    jest.spyOn(fse, 'createWriteStream').mockImplementation(((destPath: string, ...args: unknown[]) => {
      writtenDestinations.push(destPath);
      return (realCreateWriteStream as (...a: unknown[]) => unknown)(destPath, ...args);
    }) as typeof fse.createWriteStream);

    const task = copyTask({ paths: ['src/**/*'], dest: 'out' });
    await callTaskForTest(task);

    const uniqueDestinations = new Set(writtenDestinations);
    expect(writtenDestinations).toHaveLength(uniqueDestinations.size);
    expect(uniqueDestinations.size).toBe(3);
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

  it('preserves subdirectory structure under a wildcard path segment', async () => {
    mockfs({
      'src/sub1/file.txt': '1',
      'src/sub2/file.txt': '2',
    });
    // The base path is everything up to the first `*` segment (`src`), so the wildcard-matched
    // directory names are preserved relative to `dest`.
    const task = copyTask({ paths: ['src/*/file.txt'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/sub1/file.txt')).toBe(true);
    expect(fse.existsSync('out/sub2/file.txt')).toBe(true);
  });

  it('strips the literal directory prefix before the first wildcard', async () => {
    mockfs({
      'assets/img/a.png': 'a',
      'assets/img/b.png': 'b',
    });
    // The base path is the literal prefix up to the first `*` (`assets/img`), so matched files are
    // copied directly into `dest` without the `assets/img` prefix.
    const task = copyTask({ paths: ['assets/img/*.png'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/a.png')).toBe(true);
    expect(fse.existsSync('out/b.png')).toBe(true);
    expect(fse.existsSync('out/assets/img/a.png')).toBe(false);
  });

  it.each([
    ['trailing wildcard in a filename segment', 'src/file*.txt'],
    ['single-character wildcard', 'src/file?.txt'],
    ['character class', 'src/file[12].txt'],
    ['brace expansion', 'src/file{1,2}.txt'],
  ])('resolves the base from a segment with mid-segment magic (%s)', async (_name, pattern) => {
    mockfs({
      'src/file1.txt': '1',
      'src/file2.txt': '2',
    });
    // The magic segment (e.g. `file*.txt`) determines the base (`src`), so matches land directly in
    // `dest` rather than escaping it via `../` relative paths.
    const task = copyTask({ paths: [pattern], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.existsSync('out/file1.txt')).toBe(true);
    expect(fse.existsSync('out/file2.txt')).toBe(true);
    // Regression guard: files must not be written outside `dest`.
    expect(fse.existsSync('file1.txt')).toBe(false);
    expect(fse.existsSync('file2.txt')).toBe(false);
  });

  it('creates destination directory if it does not exist', async () => {
    mockfs({
      'src/file.txt': 'content',
    });
    const task = copyTask({ paths: ['src/file.txt'], dest: 'nested/output/dir' });
    await callTaskForTest(task);
    expect(fse.existsSync('nested/output/dir/file.txt')).toBe(true);
  });

  it('copies full file contents without truncation', async () => {
    // A large file is more likely to surface a premature completion: the task must not signal done
    // until the destination is fully flushed and closed, not merely when the source finishes reading.
    const largeContent = 'x'.repeat(5 * 1024 * 1024);
    mockfs({
      'src/large.txt': largeContent,
    });
    const task = copyTask({ paths: ['src/large.txt'], dest: 'out' });
    await callTaskForTest(task);
    expect(fse.readFileSync('out/large.txt', 'utf8')).toBe(largeContent);
  });

  it('propagates read errors', async () => {
    mockfs({
      'src/file.txt': 'content',
    });
    jest.spyOn(fse, 'createReadStream').mockImplementation(() => {
      const readStream = new Readable({ read() {} });
      process.nextTick(() => readStream.destroy(new Error('read failed')));
      return readStream as ReturnType<typeof fse.createReadStream>;
    });
    const task = copyTask({ paths: ['src/file.txt'], dest: 'out' });
    await expect(callTaskForTest(task)).rejects.toThrow('read failed');
  });
});
