import { logger, TaskFunction } from 'just-task';

export function apiExtractorVerifyTask(config: any, options: any): TaskFunction {
  return function apiExtractorVerify() {
    if (!apiExtractorWrapper(config, options)) {
      throw 'The public API file is out of date. Please run "npm run update-api" and commit the updated API file.';
    }
  };
}

export function apiExtractorUpdateTask(config: any, options: any): TaskFunction {
  return function apiExtractorUpdate() {
    if (!apiExtractorWrapper(config, options)) {
      logger.warn(`- Update API: API file is out of date, updating...`);
      apiExtractorWrapper(config, { ...options, localBuild: true });
      logger.info(`- Update API: successfully updated API file, verifying the updates...`);

      if (!apiExtractorWrapper(config, options)) {
        throw Error(`- Update API: failed to update API file.`);
      } else {
        logger.info(
          `- Update API: successully verified API file. Please commit API file as part of your changes.`
        );
      }
    } else {
      logger.info(`- Update API: API file is already up to date, no update needed.`);
    }
  };
}

function mergeConfig(extractorConfig: any): any {
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

function apiExtractorWrapper(extractorConfig: any, extractorOptions: any) {
  const { Extractor } = require('@microsoft/api-extractor');
  const config = mergeConfig(extractorConfig);
  logger.info(`Extracting Public API surface from '${config.project.entryPointSourceFile}'`);
  const extractor = new Extractor(config, extractorOptions);
  return extractor.processProject();
}
