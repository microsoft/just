const path = require('path');

/** Jest config for packages within the just monorepo */
module.exports = {
  roots: ['<rootDir>/src'],
  // moduleDirectories: [
  //   'node_modules',
  //   '<rootDir>/node_modules',
  //   '<rootDir>../../common/temp/node_modules'
  // ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
  reporters: [path.resolve(__dirname, './jest-reporter.js')],
  verbose: true
};
