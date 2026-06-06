// @ts-check
/** @type {import('beachball').BeachballConfig} */
const config = {
  commit: false,
  // TODO (release): change back to major
  disallowedChangeTypes: ['prerelease'],
  // TODO (release): remove
  canaryName: 'alpha',
  // TODO (release): remove
  tag: 'next',
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
