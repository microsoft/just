const path = require('path');

/** Jest config for packages within the just monorepo */
module.exports = {
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
  reporters: [path.resolve(__dirname, './jest-reporter.js')],
  verbose: true,
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(process.cwd(), 'tsconfig.json'),
      packageJson: path.resolve(process.cwd(), 'package.json')
    }
  }
};
