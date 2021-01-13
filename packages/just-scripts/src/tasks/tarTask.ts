import { resolve, logger, TaskFunction } from 'just-task';
import { createWriteStream, createReadStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { Stream } from 'stream';

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

  /** whether to gzip or not, either a boolean or uses the `zlib.Gzip` options like level, memLevel  */
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

/**
 * Creates an tar (optionally gzipped) archive
 * @param options
 */
export function createTarTask(options: CreateOptions = { file: 'archive.tar.gz' }): TaskFunction {
  const resolvedTar = resolve('tar-fs');

  // Inject default options
  options = { cwd: process.cwd(), gzip: true, ...options };

  // Validate whether tar-fs is installed
  if (!resolvedTar) {
    logger.error('Please make sure to have "tar-fs" as a dependency in your package.json');
    throw new Error('Required dependency "tar-fs" is not installed!');
  }

  const tar = require(resolvedTar);

  const { entries, file, cwd, ...restOptions } = options;

  return function archive(done) {
    let tarStream = tar.pack(cwd, {
      entries,
      finalize: true,
      finish: () => {
        done();
      },
      ...restOptions,
    });

    if (options.gzip) {
      const gzip = typeof options.gzip === 'boolean' ? createGzip() : createGzip(options.gzip as any);
      tarStream = tarStream.pipe(gzip);
    }

    tarStream.pipe(createWriteStream(options.file));
  };
}

export interface ExtractOptions {
  /** output file */
  file: string;

  /** whether to gzip or not, either a boolean or uses the `zlib.Gzip` options like level, memLevel  */
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
 * Creates an tar (optionally gzipped) archive
 * @param options
 */
export function extractTarTask(options: ExtractOptions = { file: 'archive.tar.gz' }): TaskFunction {
  const resolvedTar = resolve('tar-fs');

  // Inject default options
  options = { cwd: process.cwd(), gzip: true, ...options };

  // Validate whether tar-fs is installed
  if (!resolvedTar) {
    logger.error('Please make sure to have "tar-fs" as a dependency in your package.json');
    throw new Error('Required dependency "tar-fs" is not installed!');
  }

  const tar = require(resolvedTar);

  const { cwd, file, ...restOptions } = options;

  return function extract(done) {
    let tarStream: Stream = createReadStream(file);

    if (options.gzip) {
      const gunzip = createGunzip();
      tarStream = tarStream.pipe(gunzip);
    }

    tarStream = tarStream.pipe(
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
