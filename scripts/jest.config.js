// @ts-check
const path = require('path');

/**
 * Jest config for packages within the just monorepo
 * @type {import('@jest/types').Config.InitialOptions}
 */
const config = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
  verbose: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: path.join(process.cwd(), 'tsconfig.json'),
        packageJson: path.join(process.cwd(), 'package.json'),
        // badly-named option means skip type checking (it's done as part of the build)
        isolatedModules: true,
      },
    ],
  },
};
module.exports = config;
