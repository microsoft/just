import { describe, expect, it, jest, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import fse from 'fs-extra';
import { copyTask } from '../copyTask';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');

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

  it('creates destination directory if it does not exist', async () => {
    mockfs({
      'src/file.txt': 'content',
    });
    const task = copyTask({ paths: ['src/file.txt'], dest: 'nested/output/dir' });
    await callTaskForTest(task);
    expect(fse.existsSync('nested/output/dir/file.txt')).toBe(true);
  });

  it('handles deprecated (paths, dest) signature', async () => {
    mockfs({
      'src/file.txt': 'content',
    });
    const task = copyTask(['src/file.txt'], 'out');
    await callTaskForTest(task);
    expect(fse.existsSync('out/file.txt')).toBe(true);
  });
});
