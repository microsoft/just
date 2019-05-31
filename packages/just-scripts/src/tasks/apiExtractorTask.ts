import { logger, TaskFunction } from 'just-task';
import { ExtractorResult, Extractor, ExtractorConfig, IExtractorInvokeOptions } from '@microsoft/api-extractor';

export function apiExtractorVerifyTask(configJsonFilePath: string, options: IExtractorInvokeOptions): TaskFunction {
  return function apiExtractorVerify() {
    if (!apiExtractorWrapper(configJsonFilePath, options).succeeded) {
      throw 'The public API file is out of date. Please run "npm run update-api" and commit the updated API file.';
    }
  };
}

export function apiExtractorUpdateTask(configJsonFilePath: string, options: IExtractorInvokeOptions): TaskFunction {
  return function apiExtractorUpdate() {
    if (!apiExtractorWrapper(configJsonFilePath, options).succeeded) {
      logger.warn(`- Update API: API file is out of date, updating...`);
      apiExtractorWrapper(configJsonFilePath, { ...options, localBuild: true });
      logger.info(`- Update API: successfully updated API file, verifying the updates...`);

      if (!apiExtractorWrapper(configJsonFilePath, options).succeeded) {
        throw Error(`- Update API: failed to update API file.`);
      } else {
        logger.info(`- Update API: successully verified API file. Please commit API file as part of your changes.`);
      }
    } else {
      logger.info(`- Update API: API file is already up to date, no update needed.`);
    }
  };
}

function apiExtractorWrapper(configJsonFilePath: string, extractorOptions: IExtractorInvokeOptions): ExtractorResult {
  const config = ExtractorConfig.loadFileAndPrepare(configJsonFilePath);
  logger.info(`Extracting Public API surface from '${config.mainEntryPointFilePath}'`);
  return Extractor.invoke(config, extractorOptions);
}
