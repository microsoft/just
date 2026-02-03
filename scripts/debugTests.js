// @ts-check
const fs = require('fs');
const jest = require('jest');
const path = require('path');

const args = process.argv.slice(2);

function findPackageRoot(/** @type {string} */ cwd) {
  let dir = cwd;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("Couldn't find the package root from " + cwd);
}

function start() {
  const packagePath = findPackageRoot(process.cwd());

  process.chdir(packagePath);

  console.log(`Starting Jest debugging at: ${packagePath}`);

  return jest.run(['--runInBand', '--watch', '--testTimeout=999999999', ...args]);
}

start().catch(err => {
  console.error(err?.stack || err);
  process.exit(1);
});
