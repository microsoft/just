import { createReadStream, createWriteStream } from 'fs';
import type { TaskFunction } from 'just-task';
import { pipeline } from 'stream';
import { createGunzip, createGzip } from 'zlib';
import { tryRequire } from '../tryRequire';

export interface EntryHeader {
  name: string;
  size: number;

  /** entry mode. defaults to to 0755 for dirs and 0644 otherwise */
  mode: number;

  /** last modified date for entry. defaults to now. */
  mtime: Date;

  /** type of entry (others exist but don't appear supported by `tar-fs`). defaults to "file". */
  type: 'file' | 'directory' | 'link' | 'symlink';

  /** linked file name */
  linkname?: string;

  uid: number;
  gid: number;
}

export interface CreateOptions {
  /** output file */
  file: string;

  /** Whether to gzip or not. @default true */
  gzip?: boolean | { level?: number; memLevel?: number };

  /** the context path of the tar pack */
  cwd?: string;

  // Options below are passed through to tar-fs

  /** filter (ignore) entries */
  filter?: (path: string) => boolean;

  /** change the header in the entry (e.g. to replace prefix) */
  map?: (header: EntryHeader) => EntryHeader;

  /** whether to dereference links */
  dereference?: boolean;

  /** specify a set of entries to be packed */
  entries?: string[];
}

/**
 * Create a task to create a tar (optionally gzipped) archive.
 * Throws if `tar-fs` is not found.
 */
export function createTarTask(opts: CreateOptions = { file: 'archive.tar.gz' }): TaskFunction {
  return function archive(done) {
    const tar = getTarFs();
    const options = getOptionsWithDefaults(opts);

    const { file, cwd, gzip, ...restOptions } = options;

    // Use the pipeline helper for proper error handling
    pipeline(
      [
        tar.pack(cwd, { finalize: true, ...restOptions }),
        ...(gzip ? [createGzip(typeof gzip === 'boolean' ? {} : gzip)] : []),
        createWriteStream(file),
      ],
      done,
    );
  };
}

export interface ExtractOptions {
  /** output file */
  file: string;

  /** Whether the archive is gzipped @default true */
  gzip?: boolean;

  /** the context path of the tar pack */
  cwd?: string;

  // Options below are passed through to tar-fs

  /** filter (ignore) entries */
  filter?: (path: string, header?: EntryHeader) => boolean;

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
}

/**
 * Create a task to extract a tar (optionally gzipped) archive.
 * Throws if `tar-fs` is not found.
 */
export function extractTarTask(opts: ExtractOptions = { file: 'archive.tar.gz' }): TaskFunction {
  return function extract(done) {
    const tar = getTarFs();
    const options = getOptionsWithDefaults(opts);

    const { cwd, file, gzip, ...restOptions } = options;

    pipeline([createReadStream(file), ...(gzip ? [createGunzip()] : []), tar.extract(cwd, restOptions)], done);
  };
}

/** fill in `cwd` and `gzip: true` defaults */
function getOptionsWithDefaults<T extends CreateOptions | ExtractOptions>(options: T) {
  return {
    gzip: true,
    ...options,
    cwd: options.cwd || process.cwd(),
  };
}

/** Find `tar-fs` and throw if not installed */
function getTarFs() {
  const tar = tryRequire<typeof import('tar-fs')>('tar-fs');
  if (!tar) {
    throw new Error('Required dependency "tar-fs" is not installed!');
  }
  return tar;
}
