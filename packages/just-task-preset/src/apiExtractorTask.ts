import { logger } from 'just-task';
import { Extractor } from '@microsoft/api-extractor';
import { IExtractorConfig, IExtractorOptions } from '@microsoft/api-extractor/dist/index-internal';

export function apiExtractorTask(extractorConfig: IExtractorConfig, extractorOptions: Partial<IExtractorOptions>) {
  // This interface represents the API Extractor config file contents
  const config: IExtractorConfig = {
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

  return function apiExtractor(done: (err?: Error) => void) {
    logger.info(`Extracting Public API surface from index`);
    const extractor = new Extractor(config, extractorOptions);
    const success = extractor.processProject();
    if (!success) {
      throw 'The public API file is out of date. Please run "npm run update-api" and commit the updated API file.';
    }

    done();
  };
}
