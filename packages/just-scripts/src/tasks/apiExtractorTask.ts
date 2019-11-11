import { logger, TaskFunction } from 'just-task';
import fs from 'fs-extra';
import path from 'path';
import { tryRequire } from '../tryRequire';
// This is a TYPING ONLY import from <root>/typings/api-extractor.d.ts
import * as ApiExtractorTypes from '@microsoft/api-extractor';

/**
 * Subset of the options from `IExtractorConfigOptions` that are exposed via this just task,
 * plus additional options specific to the task.
 */
export interface ApiExtractorOptions {
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
   * the config file). It will also remove trailing spaces.
   */
  fixNewlines?: boolean;

  /**
   * Callback after api-extractor is invoked.
   * @param result - Result of invoking api-extractor. Actual type is `ExtractorResult` from `@microsoft/api-extractor`.
   * @param extractorOptions - Options with which api-extractor was invoked. Actual type is `IExtractorInvokeOptions`.
   */
  onResult?: (result: any, extractorOptions: any) => void;
}

interface ApiExtractorContext {
  /** Original options */
  options: ApiExtractorOptions;
  /** Just the options to pass to api-extractor */
  extractorOptions: ApiExtractorTypes.IExtractorInvokeOptions;
  /** Loaded config file */
  config: ApiExtractorTypes.ExtractorConfig;
  /** Actual api-extractor module */
  apiExtractorModule: typeof ApiExtractorTypes;
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
    const context = initApiExtractor(options);
    if (context) {
      const apiExtractorResult = apiExtractorWrapper(context);

      if (apiExtractorResult && !apiExtractorResult.succeeded) {
        throw new Error('The public API file is out of date. Please run the API snapshot and commit the updated API file.');
      }
    }
  };
}

/**
 * Updates the API extractor snapshot
 *
 * Sample config which should be saved as api-extractor.json:
 * ```
 * {
 *   "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
 *   "mainEntryPointFilePath": "<projectFolder>/lib/index.d.ts",
 *   "docModel": {
 *     "enabled": true
 *   },
 *   "dtsRollup": {
 *     "enabled": true
 *   },
 *   "apiReport": {
 *     "enabled": true
 *   }
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
    const context = initApiExtractor(options);
    if (context) {
      const apiExtractorResult = apiExtractorWrapper(context);

      if (apiExtractorResult) {
        if (!apiExtractorResult.succeeded) {
          logger.warn(`- Update API: API file is out of date, updating...`);
          fs.copyFileSync(context.config.reportTempFilePath, context.config.reportFilePath);

          logger.info(`- Update API: successfully updated API file, verifying the updates...`);

          if (!apiExtractorWrapper(context)!.succeeded) {
            throw new Error(`- Update API: failed to verify API updates.`);
          } else {
            logger.info(`- Update API: successully verified API file. Please commit API file as part of your changes.`);
          }
        } else {
          logger.info(`- Update API: API file is already up to date, no update needed.`);
        }
      }
    }
  };
}

/**
 * Load the api-extractor module (if available) and the config file.
 */
function initApiExtractor(options: ApiExtractorOptions): ApiExtractorContext | undefined {
  const apiExtractorModule: typeof ApiExtractorTypes = tryRequire('@microsoft/api-extractor');

  if (!apiExtractorModule) {
    logger.warn('@microsoft/api-extractor package not detected. This task will have no effect.');
    return;
  }

  if (!apiExtractorModule.Extractor.invoke) {
    logger.warn('Please update your @microsoft/api-extractor package. This task will have no effect.');
    return;
  }

  const { ExtractorConfig } = apiExtractorModule;
  const { configJsonFilePath = ExtractorConfig.FILENAME, fixNewlines, onResult, ...extractorOptions } = options;

  if (!fs.existsSync(configJsonFilePath)) {
    const defaultConfig = path.resolve(__dirname, '../../config/apiExtractor/api-extractor.json');
    logger.warn(`Config file not found for api-extractor! Please copy ${defaultConfig} to project root folder to try again`);
    return;
  }

  const config = ExtractorConfig.loadFileAndPrepare(configJsonFilePath);

  return { apiExtractorModule, config, extractorOptions, options };
}

function apiExtractorWrapper({
  apiExtractorModule,
  config,
  extractorOptions,
  options
}: ApiExtractorContext): ApiExtractorTypes.ExtractorResult | undefined {
  const { Extractor } = apiExtractorModule;

  logger.info(`Extracting Public API surface from '${config.mainEntryPointFilePath}'`);
  const result = Extractor.invoke(config, extractorOptions);
  if (options.onResult) {
    options.onResult(result, extractorOptions);
  }

  if (options.fixNewlines) {
    fixApiFileNewlines(options.localBuild ? config.reportFilePath : config.reportTempFilePath, { sampleFilePath: config.apiJsonFilePath });
  }
  return result;
}

/**
 * Update the newlines of the API report file to be consistent with other files in the repo,
 * and remove trailing spaces.
 * @param apiFilePath - Path to the API report file
 * @param newlineOptions - Provide either `newline` to specify the type of newlines to use,
 * or `sampleFilePath` to infer the newline type from a file.
 */
export function fixApiFileNewlines(apiFilePath: string, newlineOptions: { sampleFilePath?: string; newline?: string }): void {
  let newline: string;
  if (newlineOptions.newline) {
    newline = newlineOptions.newline;
  } else if (newlineOptions.sampleFilePath) {
    const sampleFile = fs.readFileSync(newlineOptions.sampleFilePath).toString();
    newline = sampleFile.match(/\r?\n/)![0];
  } else {
    throw new Error('fixApiFileNewlines: you must provide either newlineOptions.sampleFilePath or newlineOptions.newline');
  }
  const contents = fs.readFileSync(apiFilePath).toString();
  // Replace newlines. Also remove trailing spaces (second regex gets a trailing space on the
  // last line of the file).
  fs.writeFileSync(apiFilePath, contents.replace(/ ?\r?\n/g, newline).replace(/ $/, ''));
}
