// @ts-check
/** @type {import('beachball').BeachballConfig} */
const config = {
  groupChanges: true,
  branch: 'main',
  disallowedChangeTypes: ['major'],
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
