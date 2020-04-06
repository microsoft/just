import { resolve, logger, TaskFunction } from 'just-task';
import { Stats } from 'fs';

type ArchiveErrorCode =
  | 'TAR_ENTRY_INFO'
  | 'TAR_ENTRY_INVALID'
  | 'TAR_ENTRY_ERROR'
  | 'TAR_ENTRY_UNSUPPORTED'
  | 'TAR_ABORT'
  | 'TAR_BAD_ARCHIVE';

export { ArchiveErrorCode };

export interface CreateOptions {
  file: string;
  gzip?:
    | boolean
    | {
        level?: number;
        memLevel?: number;
      };
  cwd?: string;
  onwarn?: (code: ArchiveErrorCode, message: string, data: any) => void;
  prefix?: string;
  filter?: (path: string, stat: Stats) => boolean;
  preservePaths?: boolean;
  mode?: number;
  noDirRecurse?: boolean;
  follow?: boolean;
  noMtime?: boolean;
  mtime?: Date;
}

export interface CreateArchiveTaskOptions extends CreateOptions {
  fileList?: string[];
  glob?: string[] | string;
  globOptions?: any;
}

/**
 * Creates an tar (optionally gzipped) archive
 * @param options
 */
export function createTarTask(options: CreateArchiveTaskOptions = { file: 'archive.tar.gz' }): TaskFunction {
  const resolvedTar = resolve('tar');
  const resolvedGlob = resolve('glob');

  if (!resolvedTar) {
    logger.error('Please make sure to have "tar" as a dependency in your package.json');
    throw new Error('Required dependency "tar" is not installed');
  }

  const tar = require(resolvedTar);
  let { fileList = [], glob, globOptions = {}, ...restOptions } = options;

  if (glob && resolvedGlob) {
    const globModule = require(resolvedGlob);
    glob = Array.isArray(glob) ? glob : [glob];

    fileList = glob.reduce((collection, pattern) => {
      return collection.concat(globModule.sync(pattern, { ...(restOptions.cwd ? { cwd: restOptions.cwd } : undefined), ...globOptions }));
    }, []);
  }

  return function archive() {
    return tar.create(restOptions, fileList);
  };
}

export interface ExtractOptions {
  file: string;
  gzip?:
    | boolean
    | {
        level?: number;
        memLevel?: number;
      };
  cwd?: string;
  newer?: boolean;
  strip?: number;
  onwarn?: (code: ArchiveErrorCode, message: string, data: any) => void;
  preserveOwner?: boolean;
  filter?: (path: string, stat: Stats) => boolean;
  preservePaths?: boolean;
  unlink?: boolean;
  noMtime?: boolean;
}

export interface ExtractArchiveTaskOptions extends ExtractOptions {
  fileList?: string[];
}

/**
 * Creates an tar (optionally gzipped) archive
 * @param options
 */
export function extractTarTask(options: ExtractArchiveTaskOptions = { file: 'archive.tar.gz' }): TaskFunction {
  const resolvedTar = resolve('tar');

  if (!resolvedTar) {
    logger.error('Please make sure to have "tar" as a dependency in your package.json');
    throw new Error('Required dependency "tar" is not installed');
  }

  const tar = require(resolvedTar);
  const { fileList, ...restOptions } = options;

  return function archive() {
    return tar.extract(restOptions, fileList);
  };
}
