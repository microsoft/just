/**
 * defers the actual parsing and loading of a JSON file behind a loader function.  Generally the
 * existence check will already be completed such that a successful return can be guaranteed
 */
export type ConfigLoader<T> = () => T;

/**
 * Rush project info, corresponds to each project within the larger rush repo
 */
export interface RushProject {
  packageName: string;
  projectFolder: string;
  shouldPublish?: boolean;
  versionPolicyName?: string;
}

/**
 * Root of the parsed rush json
 */
export interface RushJson {
  projects: RushProject[];
  rushVersion: string;
  // more properties can be added as needed
}

/**
 * Loader type for deferred loading of rush JSON
 */
export type RushJsonLoader = ConfigLoader<RushJson>;

/**
 * Format for lerna json, packages reflect the globs denoting sub-packages
 */
export interface LernaJson {
  packages: string[];
  useWorkspaces?: boolean;
  npmClient?: string;
  version?: string;
}

/**
 * Loader type for deferred loading of lerna json
 */
export type LernaJsonLoader = ConfigLoader<LernaJson>;

interface Dependencies {
  [key: string]: string;
}

export interface PackageJson {
  name: string;
  description?: string;
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
  keywords?: string;
  just?: {
    /** Indicator that this package should be treated as the root */
    root?: boolean;

    /** Stack that the package is tracking */
    stack?: string;
  };
  [key: string]: any;
}

/**
 * loader type for deferred loading of package JSON
 */
export type PackageJsonLoader = ConfigLoader<PackageJson>;
