import { PackageJsonLoader } from './configTypes';

export interface PackageEntry {
  path: string;
  getConfig: PackageJsonLoader;
  dependencies: { [key: string]: PackageEntry };
}

export interface PackageInfo {
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