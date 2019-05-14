#!/usr/bin/env node

const path = require('path');
const configIndex = process.argv.indexOf('--config');

let configFilePath = '';

if (configIndex > -1 && process.argv.length >= configIndex + 2) {
  const configFile = process.argv[configIndex + 1];
  configFilePath = path.resolve(path.dirname(configFile));
}

const resolvePath = configFilePath || process.cwd();

let localCmd = null;

try {
  localCmd = require.resolve('just-task/lib/cli.js', { paths: [resolvePath, __dirname] });
} catch (e) {
  console.error('Please install a local copy of just-task.');
  process.exit(1);
}

try {
  require(localCmd);
} catch (e) {
  console.log('Just encountered an error', e);
  process.exit(1);
}
