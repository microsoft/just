import { logger, type TaskFunction } from 'just-task';
import fs from 'fs-extra';
import path from 'path';
import { tryRequire } from '../tryRequire';
import type * as ApiExtractorTypes from '@microsoft/api-extractor';

/**
 * Options from `IExtractorConfigOptions` plus additional options specific to the task.
 */
export interface ApiExtractorOptions extends ApiExtractorTypes.IExtractorInvokeOptions {
  /** The project folder to be used for reporting output paths. */
  projectFolder?: string;

  /** The config file path */
  configJsonFilePath?: string;

  /**
   * Callback after api-extractor is invoked.
   */
  onResult?: (
    result: ApiExtractorTypes.ExtractorResult,
    extractorOptions: ApiExtractorTypes.IExtractorInvokeOptions,
  ) => void;

  /**
   * Callback after the config file is loaded.
   * Provides the opportunity to modify the config before running API Extractor.
   */
  onConfigLoaded?: (config: ApiExtractorTypes.IConfigFile) => void;
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

/**
 * Create a task to verify the API report. Errors if the report is out of date.
 *
 * Logs a warning if `@microsoft/api-extractor` or a config file is not found.
 */
export function apiExtractorVerifyTask(options: ApiExtractorOptions): TaskFunction {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async function apiExtractorVerify() {
    const context = initApiExtractor(options);
    if (!context) return;

    const apiExtractorResult = apiExtractorWrapper(context);

    if (apiExtractorResult && !apiExtractorResult.succeeded) {
      throw new Error(
        'The public API file is out of date. Please run the API snapshot and commit the updated API file.',
      );
    }
  };
}

/**
 * Create a task to update the API report file.
 *
 * Logs a warning if `@microsoft/api-extractor` or a config file is not found.
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
export function apiExtractorUpdateTask(options: ApiExtractorOptions): TaskFunction {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async function apiExtractorUpdate() {
    const context = initApiExtractor(options);
    if (!context) return;

    const apiExtractorResult = apiExtractorWrapper(context);

    if (apiExtractorResult.succeeded) {
      logger.info(`- Update API: API file is already up to date, no update needed.`);
      return;
    }

    logger.warn(`- Update API: API file is out of date, updating...`);
    fs.mkdirpSync(path.dirname(context.config.reportFilePath)); // ensure destination exists
    fs.copyFileSync(context.config.reportTempFilePath, context.config.reportFilePath);

    logger.info(`- Update API: successfully updated API file, verifying the updates...`);

    const updateResult = apiExtractorWrapper(context);
    if (updateResult.succeeded) {
      logger.info(`- Update API: successully verified API file. Please commit API file as part of your changes.`);
    } else {
      throw new Error(`- Update API: failed to verify API updates.`);
    }
  };
}

/**
 * Load the api-extractor module (if available) and the config file.
 * Logs a warning and returns undefined if api-extractor or the config file couldn't be found.
 */
function initApiExtractor(options: ApiExtractorOptions): ApiExtractorContext | undefined {
  const apiExtractorModule = tryRequire<typeof ApiExtractorTypes>('@microsoft/api-extractor');

  if (!apiExtractorModule) {
    logger.warn('@microsoft/api-extractor package not found, so this task has no effect.');
    return;
  }

  if (!apiExtractorModule.Extractor.invoke) {
    logger.warn('Please update your @microsoft/api-extractor package. This task will have no effect.');
    return;
  }

  const { ExtractorConfig } = apiExtractorModule;
  const { configJsonFilePath = ExtractorConfig.FILENAME, onResult, ...extractorOptions } = options;

  if (!fs.existsSync(configJsonFilePath)) {
    logger.warn('API Extractor config file not found, so this task has no effect.');
    return;
  }

  const rawConfig = ExtractorConfig.loadFile(configJsonFilePath);
  // Allow modification of the config
  options.onConfigLoaded?.(rawConfig);
  // This follows the logic from ExtractorConfig.loadFileAndPrepare
  // https://github.com/microsoft/rushstack/blob/1eb3d8ccf2a87b90a1038bf464b0b73fb3c7fd78/apps/api-extractor/src/api/ExtractorConfig.ts#L455

  const prepareConfig = {
    configObject: rawConfig,
    configObjectFullPath: path.resolve(configJsonFilePath),
    packageJsonFullPath: path.resolve('package.json'),
  };

  // Respect projectFolder if provided.
  if (options.projectFolder) {
    prepareConfig.configObject.projectFolder = options.projectFolder;
  }

  const config = ExtractorConfig.prepare(prepareConfig);

  return { apiExtractorModule, config, extractorOptions, options };
}

function apiExtractorWrapper({
  apiExtractorModule,
  config,
  extractorOptions,
  options,
}: ApiExtractorContext): ApiExtractorTypes.ExtractorResult {
  const { Extractor } = apiExtractorModule;

  logger.info(`Extracting Public API surface from '${config.mainEntryPointFilePath}'`);
  const result = Extractor.invoke(config, extractorOptions);
  options.onResult?.(result, extractorOptions);

  return result;
}
