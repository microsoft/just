import { describe, expect, it, jest, afterEach } from '@jest/globals';
import mockfs from 'mock-fs';
import fse from 'fs-extra';
import os from 'os';
import path from 'path';
// Ensure tar-fs is loaded into the require cache before mock-fs takes over the filesystem,
// since module resolution reads from disk.
import tarFs from 'tar-fs';
import { createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createTarTask, extractTarTask } from '../tarTask';
import { tryRequire } from '../../tryRequire';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');

jest.mock('../../tryRequire', () => ({
  tryRequire: jest.fn((name: string) => (name === 'tar-fs' ? tarFs : null)),
}));
const mockTryRequire = tryRequire as jest.MockedFunction<typeof tryRequire>;

afterEach(() => {
  mockfs.restore();
});

describe('createTarTask', () => {
  it('throws if tar-fs is not installed', () => {
    mockTryRequire.mockReturnValueOnce(null);
    expect(() => createTarTask({ file: 'out.tar' })).toThrow('Required dependency "tar-fs" is not installed');
  });

  it('creates a gzipped tar archive that can be extracted with the same contents', async () => {
    mockfs({
      src: { 'a.txt': 'aaa', 'b.txt': 'bbb', sub: { 'c.txt': 'ccc' } },
      out: {},
      extracted: {},
    });

    const archivePath = path.resolve('out/archive.tar.gz');
    await callTaskForTest(createTarTask({ file: archivePath, cwd: path.resolve('src') }));
    expect(fse.existsSync(archivePath)).toBe(true);
    // gzipped files start with the magic bytes 1f 8b
    const header = fse.readFileSync(archivePath).subarray(0, 2);
    expect(header[0]).toBe(0x1f);
    expect(header[1]).toBe(0x8b);

    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted') }));
    expect(fse.readFileSync('extracted/a.txt', 'utf8')).toBe('aaa');
    expect(fse.readFileSync('extracted/b.txt', 'utf8')).toBe('bbb');
    expect(fse.readFileSync('extracted/sub/c.txt', 'utf8')).toBe('ccc');
  });

  it('creates an uncompressed tar archive (gzip: false) that can be extracted', async () => {
    mockfs({
      src: { 'a.txt': 'hello' },
      out: {},
      extracted: {},
    });

    const archivePath = path.resolve('out/archive.tar');
    await callTaskForTest(createTarTask({ file: archivePath, cwd: path.resolve('src'), gzip: false }));
    expect(fse.existsSync(archivePath)).toBe(true);
    // not gzipped: should not start with the gzip magic bytes
    const header = fse.readFileSync(archivePath).subarray(0, 2);
    expect(header[0] === 0x1f && header[1] === 0x8b).toBe(false);

    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted'), gzip: false }));
    expect(fse.readFileSync('extracted/a.txt', 'utf8')).toBe('hello');
  });

  it('honors the entries option to limit packed files', async () => {
    mockfs({
      src: { 'keep.txt': 'keep', 'skip.txt': 'skip' },
      out: {},
      extracted: {},
    });

    const archivePath = path.resolve('out/archive.tar.gz');
    await callTaskForTest(createTarTask({ file: archivePath, cwd: path.resolve('src'), entries: ['keep.txt'] }));
    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted') }));

    expect(fse.existsSync('extracted/keep.txt')).toBe(true);
    expect(fse.existsSync('extracted/skip.txt')).toBe(false);
  });

  it('honors the filter option to exclude entries', async () => {
    mockfs({
      src: { 'a.txt': 'a', 'b.log': 'b', 'c.txt': 'c' },
      out: {},
      extracted: {},
    });

    const archivePath = path.resolve('out/archive.tar.gz');
    await callTaskForTest(
      createTarTask({
        file: archivePath,
        cwd: path.resolve('src'),
        // ignore .log files
        filter: filePath => filePath.endsWith('.log'),
      }),
    );
    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted') }));

    expect(fse.existsSync('extracted/a.txt')).toBe(true);
    expect(fse.existsSync('extracted/c.txt')).toBe(true);
    expect(fse.existsSync('extracted/b.log')).toBe(false);
  });

  it('propagates errors when the source directory does not exist', async () => {
    mockfs({ out: {} });
    const archivePath = path.resolve('out/archive.tar.gz');
    await expect(
      callTaskForTest(createTarTask({ file: archivePath, cwd: path.resolve('does-not-exist') })),
    ).rejects.toThrow('ENOENT');
  });
});

describe('extractTarTask', () => {
  const archivePath = path.resolve('archive.tar.gz');

  /**
   * Create a tar archive on the (mock) filesystem by writing fake files to a temp directory and
   * packing them with `tar-fs`, so the extract tests exercise the real archive format. `entries`
   * maps file path to content; intermediate directories are created as needed.
   */
  async function writeTarArchive(entries: Record<string, string>, options: { gzip?: boolean } = {}): Promise<void> {
    const srcDir = path.join(os.tmpdir(), 'tar-src');
    for (const [name, content] of Object.entries(entries)) {
      const filePath = path.join(srcDir, name);
      fse.mkdirpSync(path.dirname(filePath));
      fse.writeFileSync(filePath, content);
    }
    fse.mkdirpSync(path.dirname(archivePath));
    await pipeline([
      tarFs.pack(srcDir),
      ...(options.gzip !== false ? [createGzip()] : []),
      createWriteStream(archivePath),
    ]);
  }

  it('throws if tar-fs is not installed', () => {
    mockTryRequire.mockReturnValueOnce(null);
    expect(() => extractTarTask({ file: 'in.tar' })).toThrow('Required dependency "tar-fs" is not installed');
  });

  it('extracts a gzipped tar archive, recreating nested directory structure', async () => {
    mockfs({ extracted: {} });
    await writeTarArchive({ 'a.txt': 'aaa', 'b.txt': 'bbb', 'sub/c.txt': 'ccc' });

    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted') }));
    expect(fse.readFileSync('extracted/a.txt', 'utf8')).toBe('aaa');
    expect(fse.readFileSync('extracted/b.txt', 'utf8')).toBe('bbb');
    expect(fse.readFileSync('extracted/sub/c.txt', 'utf8')).toBe('ccc');
  });

  it('extracts an uncompressed tar archive (gzip: false)', async () => {
    mockfs({ extracted: {} });
    await writeTarArchive({ 'a.txt': 'hello' }, { gzip: false });

    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted'), gzip: false }));
    expect(fse.readFileSync('extracted/a.txt', 'utf8')).toBe('hello');
  });

  it('creates the destination directory if it does not exist', async () => {
    mockfs({});
    await writeTarArchive({ 'a.txt': 'aaa' });

    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('nested/dest/dir') }));
    expect(fse.readFileSync('nested/dest/dir/a.txt', 'utf8')).toBe('aaa');
  });

  it('honors the filter option to skip entries', async () => {
    mockfs({ extracted: {} });
    await writeTarArchive({ 'a.txt': 'a', 'b.log': 'b', 'c.txt': 'c' });

    await callTaskForTest(
      extractTarTask({
        file: archivePath,
        cwd: path.resolve('extracted'),
        // ignore .log files
        filter: filePath => filePath.endsWith('.log'),
      }),
    );
    expect(fse.existsSync('extracted/a.txt')).toBe(true);
    expect(fse.existsSync('extracted/c.txt')).toBe(true);
    expect(fse.existsSync('extracted/b.log')).toBe(false);
  });

  it('honors the map option to rewrite entry names', async () => {
    mockfs({ extracted: {} });
    await writeTarArchive({ 'a.txt': 'aaa' });

    await callTaskForTest(
      extractTarTask({
        file: archivePath,
        cwd: path.resolve('extracted'),
        map: header => {
          header.name = `renamed/${header.name}`;
          return header;
        },
      }),
    );
    expect(fse.readFileSync('extracted/renamed/a.txt', 'utf8')).toBe('aaa');
    expect(fse.existsSync('extracted/a.txt')).toBe(false);
  });

  it('overwrites existing files in the destination', async () => {
    mockfs({ extracted: { 'a.txt': 'old' } });
    await writeTarArchive({ 'a.txt': 'new' });

    await callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted') }));
    expect(fse.readFileSync('extracted/a.txt', 'utf8')).toBe('new');
  });

  it('propagates errors when the archive file does not exist on extract', async () => {
    mockfs({ extracted: {} });
    await expect(
      callTaskForTest(extractTarTask({ file: path.resolve('missing.tar.gz'), cwd: path.resolve('extracted') })),
    ).rejects.toThrow('ENOENT');
  });

  it('propagates errors when extracting a non-gzipped file as gzipped', async () => {
    // The archive isn't actually gzipped, so the gunzip step (gzip defaults to true) should fail.
    mockfs({ extracted: {} });
    await writeTarArchive({ 'a.txt': 'aaa' }, { gzip: false });
    await expect(
      callTaskForTest(extractTarTask({ file: archivePath, cwd: path.resolve('extracted') })),
    ).rejects.toThrow(); // current message is "incorrect header check"
  });
});
