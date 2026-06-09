import { logger, type TaskFunction } from 'just-task';
import { createWriteStream, createReadStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import type { Stream } from 'stream';
import { resolveWrapper } from '../tryRequire';

export interface EntryHeader {
  name: string;
  size: number;

  /** entry mode. defaults to to 0755 for dirs and 0644 otherwise */
  mode: number; //

  /** last modified date for entry. defaults to now. */
  mtime: Date;

  /** type of entry. defaults to "file". */
  type: 'file' | 'link' | 'symlink' | 'directory' | 'block-device' | 'character-device' | 'fifo' | 'contiguous-file';

  /** linked file name */
  linkname: string;

  uid: number;
  gid: number;
  uname: string;
  gname: string;
  devmajor: number;
  devminor: number;
}

export interface CreateOptions {
  /** output file */
  file: string;

  /** Whether to gzip or not. @default true */
  gzip?:
    | boolean
    | {
        level?: number;
        memLevel?: number;
      };

  /** the context path of the tar pack */
  cwd?: string;

  /** filter (ignore) entries */
  filter?: (path: string, header: EntryHeader) => boolean;

  /** change the header in the entry (e.g. to replace prefix) */
  map?: (header: EntryHeader) => EntryHeader;

  /** whether to dereference links */
  dereference?: boolean;

  /** specify a set of entries to be packed */
  entries?: string[];
}

export interface ExtractOptions {
  /** output file */
  file: string;

  /** Whether the archive is gzipped @default true */
  gzip?: boolean;

  /** the context path of the tar pack */
  cwd?: string;

  /** filter (ignore) entries */
  filter?: (path: string, header: EntryHeader) => boolean;

  /** change the header in the entry (e.g. to replace prefix) */
  map?: (header: EntryHeader) => EntryHeader;

  /** mode for files (e.g. `parseInt(755, 8)`)*/
  fmode?: number;

  /** mode for directories (e.g. `parseInt(755, 8)`) */
  dmode?: number;

  /** set whether all files and dirs are readable */
  readable?: boolean;

  /** set whether all files and dirs are writable */
  writable?: boolean;

  /** whether to dereference links */
  dereference?: boolean;
}

/**
 * Create a task to create a tar (optionally gzipped) archive.
 * Throws if `tar-fs` is not found.
 */
export function createTarTask(options: CreateOptions = { file: 'archive.tar.gz' }): TaskFunction {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const tar = getTarFs();
  options = getOptionsWithDefaults(options);

  const { entries, file, cwd, ...restOptions } = options;

  return function archive(done) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    let tarStream = tar.pack(cwd, {
      entries,
      finalize: true,
      finish: () => {
        done();
      },
      ...restOptions,
    });

    if (options.gzip) {
      const gzip = typeof options.gzip === 'boolean' ? createGzip() : createGzip(options.gzip);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      tarStream = tarStream.pipe(gzip);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    tarStream.pipe(createWriteStream(options.file));
  };
}

/**
 * Create a task to extract a tar (optionally gzipped) archive.
 * Throws if `tar-fs` is not found.
 */
export function extractTarTask(options: ExtractOptions = { file: 'archive.tar.gz' }): TaskFunction {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const tar = getTarFs();
  options = getOptionsWithDefaults(options);

  const { cwd, file, ...restOptions } = options;

  return function extract(done) {
    let tarStream: Stream = createReadStream(file);

    if (options.gzip) {
      const gunzip = createGunzip();
      tarStream = tarStream.pipe(gunzip);
    }

    tarStream.pipe(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      tar.extract(cwd, {
        finalize: true,
        finish: () => {
          done();
        },
        ...restOptions,
      }),
    );
  };
}

/** fill in `cwd` and `gzip: true` defaults */
function getOptionsWithDefaults<T extends CreateOptions | ExtractOptions>(options: T): T {
  return {
    cwd: process.cwd(),
    gzip: true,
    ...options,
  };
}

/** Find `tar-fs` and throw if not installed */
function getTarFs() {
  const resolvedTar = resolveWrapper('tar-fs');
  if (!resolvedTar) {
    logger.error('Please make sure to have "tar-fs" as a dependency in your package.json');
    throw new Error('Required dependency "tar-fs" is not installed!');
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return require(resolvedTar);
}
