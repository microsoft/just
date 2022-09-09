import * as path from 'path';
import * as fse from 'fs-extra';
import { PackageJson, ConfigLoader } from './interfaces/configTypes';
import { logger } from 'just-task-logger';

type LoaderFn<T> = (pkgPath: string) => T;

/** default JSON load implementation */
export function loadJson<T = object>(pkgPath: string): T {
  try {
    return fse.readJsonSync(pkgPath);
  } catch (e) {
    // this emits a warning for the bad file, then returns null (though that is against the return
    // signature)  This allows a caller to handle null but will mimic { throws: false } behavior
    logger.warn(`Invalid ${pkgPath.split(path.sep).pop()} detected.`);
    return undefined as unknown as T;
  }
}

/** loader implementation for CJSON */
export function loadCJson<T = object>(pkgPath: string): T {
  const jju = require('jju');
  try {
    const fileAsString = fse.readFileSync(pkgPath, 'utf8').toString();
    return jju.parse(fileAsString, { mode: 'cjson' });
  } catch (e) {
    // this emits a warning for the bad file, then returns null (though that is against the return
    // signature)  This allows a caller to handle null but will mimic { throws: false } behavior
    logger.warn(`Invalid ${pkgPath.split(path.sep).pop()} detected.`);
    return undefined as unknown as T;
  }
}

/**
 * A wrapper around checking if a file exists and executing an action on it if it does.  Otherwise returning
 * undefined.
 *
 * @param folder - folder path to use as the base of the config search
 * @param name - package name, if undefined or falsy the package is assumed to be included in the folder
 * @param cb - callback function to execute if the file exists
 */
function ifConfig<T>(folder: string, name: string | undefined, cb: LoaderFn<T>): T | undefined {
  const pkgPath = name ? path.join(folder, name) : folder;
  if (fse.existsSync(pkgPath)) {
    return cb(pkgPath);
  }
  return undefined;
}

/**
 * Reads and parses a configuration file from the given folder.  Will return undefined if not found.
 * @param folder - The folder path to query for the config file
 * @param name - name of the config file, if omitted the file is assumed to already be in folder
 */
export function readJsonConfig<T = object>(folder: string, name?: string, onLoad?: LoaderFn<T>): T | undefined {
  onLoad = onLoad || loadJson;
  return ifConfig<T>(folder, name, loadJson);
}

/**
 * If a file exists, return a config loader function that can be used to load the file at a later
 * time.  If the file doesn't exist will return undefined.  The closure includes storage
 * such that if the file is loaded the results will be cached.  Subsequent calls will use cached results
 *
 * If the file is to be modified this will need to be recalculated via a different method
 *
 * @param folder - The folder path to query for the config file
 * @param name - name of the config file, if omitted the file is assume to be included in folder
 */
export function getConfigLoader<T = object>(
  folder: string,
  name?: string,
  onLoad?: LoaderFn<T>,
): ConfigLoader<T> | undefined {
  onLoad = onLoad || loadJson;
  return ifConfig<ConfigLoader<T>>(folder, name, pkgPath => {
    let _storage: { config?: T } = {};
    return () => {
      if (!_storage.config) {
        _storage.config = fse.readJsonSync(pkgPath, { throws: false });
      }
      return _storage.config as T;
    };
  });
}

/**
 * Read a package json file
 * @param folder - folder path for the package.json
 */
export function readPackageJson(folder: string): PackageJson | undefined {
  return readJsonConfig<PackageJson>(folder, 'package.json');
}
