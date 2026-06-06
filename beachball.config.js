// @ts-check
/** @type {import('beachball').BeachballConfig} */
const config = {
  branch: 'v2',
  disallowedChangeTypes: ['major'],
  groupChanges: true,
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
