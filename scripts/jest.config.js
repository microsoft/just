// @ts-check
const path = require('path');

/**
 * Jest config for packages within the just monorepo
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    // https://jestjs.io/blog/2025/06/04/jest-30#globals-cleanup-between-test-files
    globalsCleanup: 'on',
  },
  testMatch: ['**/*.(spec|test).[jt]s'],
  verbose: true,
  // This prevents having to call jest.clearAllMocks() after each test.
  // jestSetup.js also calls jest.restoreAllMocks() in afterAll.
  clearMocks: true,
  setupFilesAfterEnv: [path.resolve(__dirname, 'jestSetup.js')],
  injectGlobals: false,
  reporters: ['default', 'github-actions'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: path.join(process.cwd(), 'tsconfig.json'),
        packageJson: path.join(process.cwd(), 'package.json'),
        // Contrary to the TS option, this means skip type checking within jest
        isolatedModules: true,
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ['/node_modules/'],
  watchPathIgnorePatterns: ['/node_modules/'],
};
