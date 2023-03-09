const path = require('path');

/** Jest config for packages within the just monorepo */
module.exports = {
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
      packageJson: path.resolve(process.cwd(), 'package.json'),
    },
  },
};
