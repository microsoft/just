import { logger, TaskFunction, resolveCwd } from 'just-task';
import { tryRequire } from '../tryRequire';

/** Subset of the options from IExtractorConfigOptions that are exposed via this just task */
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

  /**
   * By default API Extractor uses its own TypeScript compiler version to analyze your project.
   * This can often cause compiler errors due to incompatibilities between different TS versions.
   * Use this option to specify the folder path for your compiler version.
   */
  typescriptCompilerFolder?: string;

  /** The config file path */
  configJsonFilePath: string;
}

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export function apiExtractorVerifyTask(options: ApiExtractorOptions): TaskFunction;
/** @deprecated Use object param version */
export function apiExtractorVerifyTask(
  configJsonFilePath: string,
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'>
): TaskFunction;
export function apiExtractorVerifyTask(
  configJsonFilePathOrOption: string | ApiExtractorOptions,
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'> = {}
): TaskFunction {
  const options =
    typeof configJsonFilePathOrOption === 'string'
      ? { ...extractorOptions, configJsonFilePath: configJsonFilePathOrOption }
      : { ...configJsonFilePathOrOption };

  return function apiExtractorVerify() {
    const apiExtractorResult = apiExtractorWrapper(options.configJsonFilePath, options);

    if (apiExtractorResult && !apiExtractorResult.succeeded) {
      throw 'The public API file is out of date. Please run the API snapshot and commit the updated API file.';
    } else {
      logger.warn('@microsoft/api-extractor package not detected, this task will have no effect');
    }
  };
}

export function apiExtractorUpdateTask(options: ApiExtractorOptions): TaskFunction;
/** @deprecated Use object param version */
export function apiExtractorUpdateTask(
  configJsonFilePath: string,
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'>
): TaskFunction;
export function apiExtractorUpdateTask(
  configJsonFilePathOrOption: string | ApiExtractorOptions,
  extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'> = {}
): TaskFunction {
  const options =
    typeof configJsonFilePathOrOption === 'string'
      ? { ...extractorOptions, configJsonFilePath: configJsonFilePathOrOption }
      : { ...configJsonFilePathOrOption };

  return function apiExtractorUpdate() {
    const apiExtractorResult = apiExtractorWrapper(options.configJsonFilePath, options);

    if (apiExtractorResult) {
      if (!apiExtractorResult.succeeded) {
        logger.warn(`- Update API: API file is out of date, updating...`);
        apiExtractorWrapper(options.configJsonFilePath, { ...options, localBuild: true });
        logger.info(`- Update API: successfully updated API file, verifying the updates...`);

        if (!apiExtractorWrapper(options.configJsonFilePath, options).succeeded) {
          throw Error(`- Update API: failed to update API file.`);
        } else {
          logger.info(`- Update API: successully verified API file. Please commit API file as part of your changes.`);
        }
      } else {
        logger.info(`- Update API: API file is already up to date, no update needed.`);
      }
    } else {
      logger.warn('@microsoft/api-extractor package not detected, this task will have no effect');
    }
  };
}

function apiExtractorWrapper(configJsonFilePath: string, extractorOptions: Omit<ApiExtractorOptions, 'configJsonFilePath'>) {
  const apiExtractorModule = tryRequire('@microsoft/api-extractor');

  if (!apiExtractorModule) {
    return;
  }

  const { Extractor, ExtractorConfig } = apiExtractorModule;
  const config = ExtractorConfig.loadFileAndPrepare(configJsonFilePath);
  logger.info(`Extracting Public API surface from '${config.mainEntryPointFilePath}'`);
  return Extractor.invoke(config, extractorOptions);
}
