// @ts-check
const jest = require('jest');
const { findPackageRoot } = require('workspace-tools');

const args = process.argv.slice(2);

function start() {
  const packagePath = findPackageRoot(process.cwd());
  if (!packagePath) {
    throw new Error('Could not find package.json relative to ' + process.cwd());
  }

  process.chdir(packagePath);

  console.log(`Starting Jest debugging at: ${packagePath}`);

  return jest.run(['--runInBand', '--watch', '--testTimeout=999999999', ...args]);
}

start().catch(err => {
  console.error(err?.stack || err);
  process.exit(1);
});
