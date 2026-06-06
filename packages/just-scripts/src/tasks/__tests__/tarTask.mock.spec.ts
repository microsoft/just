import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { resolve } from 'just-task';
import { PassThrough } from 'stream';
import { createTarTask, extractTarTask } from '../tarTask';
import { callTaskForTest } from './callTaskForTest';

jest.mock('just-task/lib/logger');

const mockPack = jest.fn<(cwd: string, opts: any) => PassThrough>();
const mockExtract = jest.fn<(cwd: string, opts: any) => PassThrough>();

jest.mock('just-task', () => {
  const actual = jest.requireActual<typeof import('just-task')>('just-task');
  return {
    ...actual,
    resolve: jest.fn((name: string) => {
      if (name === 'tar-fs') return 'tar-fs';
      return actual.resolve(name);
    }),
  };
});

jest.mock(
  'tar-fs',
  () => ({
    pack: (cwd: string, opts: any) => mockPack(cwd, opts),
    extract: (cwd: string, opts: any) => mockExtract(cwd, opts),
  }),
  { virtual: true },
);

jest.mock('fs', () => {
  const actual = jest.requireActual<typeof import('fs')>('fs');
  return {
    ...actual,
    createWriteStream: jest.fn(() => new PassThrough()),
    createReadStream: jest.fn(() => {
      const stream = new PassThrough();
      process.nextTick(() => stream.end());
      return stream;
    }),
  };
});

describe('tarTask (mocked)', () => {
  beforeEach(() => {
    mockPack.mockImplementation((_cwd: string, opts: any) => {
      const stream = new PassThrough();
      process.nextTick(() => {
        opts.finish?.();
        stream.end();
      });
      return stream;
    });

    mockExtract.mockImplementation((_cwd: string, opts: any) => {
      const stream = new PassThrough();
      process.nextTick(() => {
        opts.finish?.();
      });
      return stream;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTarTask', () => {
    it('throws if tar-fs is not resolved', () => {
      (resolve as jest.Mock).mockReturnValueOnce(null);
      expect(() => createTarTask({ file: 'out.tar' })).toThrow('Required dependency "tar-fs" is not installed');
    });

    it('calls tar.pack with cwd', async () => {
      const task = createTarTask({ file: 'out.tar', cwd: '/src', gzip: false });
      await callTaskForTest(task);
      expect(mockPack).toHaveBeenCalledWith('/src', expect.objectContaining({ finalize: true }));
    });

    it('passes entries option', async () => {
      const task = createTarTask({ file: 'out.tar', entries: ['a.ts', 'b.ts'], gzip: false });
      await callTaskForTest(task);
      expect(mockPack).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ entries: ['a.ts', 'b.ts'] }));
    });
  });

  describe('extractTarTask', () => {
    it('throws if tar-fs is not resolved', () => {
      (resolve as jest.Mock).mockReturnValueOnce(null);
      expect(() => extractTarTask({ file: 'in.tar' })).toThrow('Required dependency "tar-fs" is not installed');
    });

    it('calls tar.extract with cwd', async () => {
      const task = extractTarTask({ file: 'in.tar', cwd: '/dest', gzip: false });
      await callTaskForTest(task);
      expect(mockExtract).toHaveBeenCalledWith('/dest', expect.objectContaining({ finalize: true }));
    });
  });
});
