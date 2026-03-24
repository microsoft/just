// @ts-check
/** @type {import('beachball').BeachballConfig} */
const config = {
  groupChanges: true,
  // TEMPORARY: target v3 for change files
  branch: 'v3',
  // branch: 'main',
  // disallowedChangeTypes: ['major'],
  ignorePatterns: [
    '.*ignore',
    'api-extractor.json',
    'jest.config.js',
    '**/__tests__/**',
    '**/*.spec.ts',
    '**/*.test.ts',
  ],
};

module.exports = config;
