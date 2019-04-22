const path = require('path');

/** Jest config for template packages within the just monorepo */
module.exports = {
  testEnvironment: 'node',
  reporters: [path.resolve(__dirname, './jest-reporter.js')],
  setupFilesAfterEnv: ['jest-expect-message'],
  transformIgnorePatterns: ['node_modules', 'template/'],
  testPathIgnorePatterns: ['node_modules', 'template/'],
  verbose: true
};
