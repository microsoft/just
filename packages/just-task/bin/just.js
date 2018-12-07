#!/usr/bin/env node

let localCmd = null;

try {
  localCmd = require.resolve('just-task/lib/cli.js', { paths: [process.cwd()] });
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
