import { logger, TaskFunction } from 'just-task';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import { tryRequire } from '../tryRequire';

/**
 * Subset of the options from IExtractorConfigOptions that are exposed via this just task,
 * plus additional options specific to the task.
 */
interface ApiExtractorOptions {
  /**
   * Indicates that API Extractor is running as part of a local build, e.g. on developer's
   * machine. This disables certain validation that would normally be performed
   * for a ship/production build. For example, the *.api.md report file is
   * automatically updated in a local build.
   *
   * The default value is false.
   */
  localBuild?: boolean;

  /**
   * If true, API Extractor will include {@link ExtractorLogLevel.Verbose} messages in its output.
   */
  showVerboseMessages?: boolean;

  projectFolder?: string;

  /**
   * By default API Extractor uses its own TypeScript compiler version to analyze your project.
   * This can often cause compiler errors due to incompatibilities between different TS versions.
   * Use this option to specify the folder path for your compiler version.
   */
  typescriptCompilerFolder?: string;

  /** The config file path */
  configJsonFilePath?: string;

  /**
   * API Extractor uses CRLF newlines by default and adds trailing spaces after empty comment lines,
   * both of which can add excessive noise to diffs. Set this option to true to post-process the
   * API Extractor .md file to fix these issues (newline type will be inferred from the type used in
   * the config file).
   *
   * NOTE: This option assumes the default paths for the API file: `${process.cwd()}/temp/*.api.md`
   * when verifying, or `${process.cwd()}/etc/*.api.md` when updating. If you don't use those paths,
   * import and manually call `fixApiFileNewlines()` instead.
   */
  fixNewlines?: boolean;
}

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export function apiExtractorVerifyTask(options: ApiExtractorOptions): TaskFunction;
/** @deprecated Use object param version */
export function apiExtractorVerifyTask(
  configJsonFilePath: string,
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'>
): TaskFunction;
export function apiExtractorVerifyTask(
  configJsonFilePathOrOption: string | ApiExtractorOptions = {},
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'> = {}
): TaskFunction {
  const options =
    typeof configJsonFilePathOrOption === 'string'
      ? { ...extractorOptions, configJsonFilePath: configJsonFilePathOrOption }
      : { ...configJsonFilePathOrOption };

  return function apiExtractorVerify() {
    const apiExtractorResult = apiExtractorWrapper(options);

    if (apiExtractorResult && !apiExtractorResult.succeeded) {
      throw 'The public API file is out of date. Please run the API snapshot and commit the updated API file.';
    }
  };
}

/**
 * Updates the API extractor snapshot
 *
 * Sample config which should be saved as api-extractor.json:
 * ```
 * {
 *    "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
 *    "mainEntryPointFilePath": "<projectFolder>/lib/index.d.ts",
 *    "docModel": {
 *      "enabled": true
 *    },
 *    "dtsRollup": {
 *      "enabled": true
 *    },
 *    "apiReport": {
 *      "enabled": true
 *    }
 * }
 * ```
 */
export function apiExtractorUpdateTask(options: ApiExtractorOptions): TaskFunction;
/** @deprecated Use object param version */
export function apiExtractorUpdateTask(
  configJsonFilePath: string,
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'>
): TaskFunction;
export function apiExtractorUpdateTask(
  configJsonFilePathOrOption: string | ApiExtractorOptions = {},
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'> = {}
): TaskFunction {
  const options =
    typeof configJsonFilePathOrOption === 'string'
      ? { ...extractorOptions, configJsonFilePath: configJsonFilePathOrOption }
      : { ...configJsonFilePathOrOption };

  return function apiExtractorUpdate() {
    const apiExtractorResult = apiExtractorWrapper(options);

    if (apiExtractorResult) {
      if (!apiExtractorResult.succeeded) {
        logger.warn(`- Update API: API file is out of date, updating...`);
        apiExtractorWrapper({ ...options, localBuild: true });
        logger.info(`- Update API: successfully updated API file, verifying the updates...`);

        if (!apiExtractorWrapper(options).succeeded) {
          throw Error(`- Update API: failed to update API file.`);
        } else {
          logger.info(`- Update API: successully verified API file. Please commit API file as part of your changes.`);
        }
      } else {
        logger.info(`- Update API: API file is already up to date, no update needed.`);
      }
    }
  };
}

function apiExtractorWrapper(options: ApiExtractorOptions) {
  const { configJsonFilePath = 'api-extractor.json', fixNewlines, ...extractorOptions } = options;

  const apiExtractorModule = tryRequire('@microsoft/api-extractor');

  if (!apiExtractorModule) {
    logger.warn('@microsoft/api-extractor package not detected, this task will have no effect');
    return;
  }

  if (!apiExtractorModule.Extractor.invoke) {
    logger.warn('Please update your @microsoft/api-extractor package, this task will have no effect');
    return;
  }

  if (!fs.existsSync(configJsonFilePath)) {
    const defaultConfig = path.resolve(__dirname, '../../config/apiExtractor/api-extractor.json');
    logger.warn(`Config file not found for api-extractor! Please copy ${defaultConfig} to project root folder to try again`);
    return;
  }

  const { Extractor, ExtractorConfig } = apiExtractorModule;
  const config = ExtractorConfig.loadFileAndPrepare(configJsonFilePath);

  logger.info(`Extracting Public API surface from '${config.mainEntryPointFilePath}'`);
  const result = Extractor.invoke(config, extractorOptions);

  if (fixNewlines) {
    const apiGlob = path.join(process.cwd(), `${options.localBuild ? 'etc' : 'temp'}/*.api.md`);
    const files = glob.sync(apiGlob);
    if (files[0]) {
      fixApiFileNewlines(files[0], configJsonFilePath);
    } else {
      logger.warn(
        'API Extractor task options requested fixing newlines, but an API file was not found ' +
          `under the default path of ${apiGlob}. Please manually call fixApiFileNewlines() instead.`
      );
    }
  }
  return result;
}

/**
 * Update the newlines of the API report file to be consistent with other files in the repo,
 * and remove trailing spaces.
 * @param apiFilePath - Path to the API report file
 * @param sampleFilePath - Path to another file to infer newlines from
 */
export function fixApiFileNewlines(apiFilePath: string, sampleFilePath: string): void {
  // Infer newline type from the one used in the config file
  const sampleFile = fs.readFileSync(sampleFilePath).toString();
  const newline = sampleFile.match(/\r?\n/)![0];
  const contents = fs.readFileSync(apiFilePath).toString();
  // Replace newlines. Also remove trailing spaces (second regex gets a trailing space on the
  // last line of the file).
  fs.writeFileSync(apiFilePath, contents.replace(/ ?\r?\n/g, newline).replace(/ $/, ''));
}
