const path = require('path');

/** Jest config for template packages within the just monorepo */
module.exports = {
  testEnvironment: 'node',
  reporters: [path.resolve(__dirname, './jest-reporter.js')],
  setupTestFrameworkScriptFile: 'jest-expect-message',
  verbose: true
};
