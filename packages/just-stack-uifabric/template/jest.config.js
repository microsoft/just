const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  globals: {
    'ts-jest': {
      packageJson: path.resolve(__dirname, 'package.json')
    }
  }
};
