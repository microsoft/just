import { logger, TaskFunction } from 'just-task';
import { Extractor, IExtractorConfig, IExtractorOptions } from '@microsoft/api-extractor';

/**
 * Generate a task function which runs api-extractor with the given config and options.
 * The task will throw an error if the API is out of date.
 *
 * @param extractorType Extractor class: `import { Extractor } from '@microsoft/api-extractor'`.
 * This is needed because just-scripts does not take a (non-dev) dependency on or bundle api-extractor.
 * @param config Extractor config (IExtractorConfig)
 * @param options Extractor options (IExtractorOptions)
 */
export function apiExtractorVerifyTask(
  extractorType: any,
  config: any,
  options: any
): TaskFunction {
  return function apiExtractorVerify() {
    if (!apiExtractorWrapper(extractorType, config, options)) {
      throw 'The public API file is out of date. Please run "npm run update-api" and commit the updated API file.';
    }
  };
}

/**
 * Generate a task function which runs api-extractor with the given config and options.
 * If the API is out of date, the task will generate an updated API file.
 *
 * @param extractorType Extractor class: `import { Extractor } from '@microsoft/api-extractor'`.
 * This is needed because just-scripts does not take a (non-dev) dependency on or bundle api-extractor.
 * @param config Extractor config (IExtractorConfig)
 * @param options Extractor options (IExtractorOptions)
 */
export function apiExtractorUpdateTask(
  extractorType: any,
  config: any,
  options: any
): TaskFunction {
  return function apiExtractorUpdate() {
    if (!apiExtractorWrapper(extractorType, config, options)) {
      logger.warn(`- Update API: API file is out of date; updating...`);
      apiExtractorWrapper(extractorType, config, { ...options, localBuild: true });
      logger.info(`- Update API: successfully updated API file; verifying the updates...`);

      if (!apiExtractorWrapper(extractorType, config, options)) {
        throw Error(`- Update API: failed to update API file.`);
      } else {
        logger.info(
          `- Update API: successully verified API file. Please commit API file as part of your changes.`
        );
      }
    } else {
      logger.info(`- Update API: API file is already up to date; no update needed.`);
    }
  };
}

function mergeConfig(extractorConfig: IExtractorConfig): IExtractorConfig {
  return {
    compiler: {
      configType: 'tsconfig',
      rootFolder: './'
    },
    policies: {
      namespaceSupport: 'conservative'
    },
    project: {
      entryPointSourceFile: 'lib/index.d.ts'
    },
    validationRules: {
      missingReleaseTags: 'allow' as any
    },
    ...extractorConfig
  };
}

function apiExtractorWrapper(
  extractorType: typeof Extractor,
  extractorConfig: IExtractorConfig,
  extractorOptions: IExtractorOptions
) {
  const config = mergeConfig(extractorConfig);
  logger.info(`Extracting public API surface from '${config.project.entryPointSourceFile}'`);
  const extractor = new extractorType(config, extractorOptions);
  return extractor.processProject();
}
