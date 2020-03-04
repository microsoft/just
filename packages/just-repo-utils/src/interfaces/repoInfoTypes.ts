import { PackageJsonLoader, RushJsonLoader, LernaJsonLoader } from './configTypes';

/**
 * types of supported monorepos
 */
export type MonorepoType = 'lerna' | 'rush';

/**
 * Info for the repository
 */
export interface RepoInfo {
  /** root of the enlistment */
  rootPath: string;

  /** loader for package JSON */
  getPackageJson: PackageJsonLoader;

  /** if it is a monorepo denotes whether it is rush or lerna based */
  monorepo?: MonorepoType;

  /** loader function to get the parsed rush json */
  getRushJson?: RushJsonLoader;

  /** loader function to get the parsed lerna json */
  getLernaJson?: LernaJsonLoader;
}