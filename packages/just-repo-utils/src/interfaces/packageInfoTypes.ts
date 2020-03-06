import { PackageJsonLoader } from './configTypes';

export interface PackageEntry {
  path: string;
  getConfig: PackageJsonLoader;
  dependencies: { [key: string]: PackageEntry };
}

export interface PackageEntries {
  [key: string]: PackageEntry;
}

/**
 * cache strategy to use for package info.  Values are:
 *  normal - try to load from the cache and save normally
 *  update - don't load from the cache and save a new copy to the cache
 *  no-cache - don't load or save to the cache
 */
export type CacheStrategy = 'normal' | 'no-cache' | 'update';

/**
 * optional options for package info routines
 */
export interface PackageInfoOptions {
  /**
   * caching strategy to use for package info queries, defaults to 'normal'
   */
  strategy?: CacheStrategy;

  /**
   * when querying dependencies this is the target package name to use for the query.  If
   * omitted this is assumed to be the package in process.cwd()
   */
  target?: string;
}

export interface PackageInfo {
  /**
   * Retrieve an array of paths for the entries
   */
  paths: () => string[];

  /**
   * Retrieve an array of names for the entries
   */
  names: () => string[];

  /**
   * Return a filtered PackageInfo for either targeting the name of a package or the
   * package in the current working directory
   */
  dependencies: (target?: string) => PackageInfo;

  /**
   * Raw entry table for clients who want to do name to path mappings or have access to the package
   * json files for the packages
   */
  entries: PackageEntries;
}
