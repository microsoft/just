// @ts-check

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const spawnAsync = require('./spawnAsync');

const ToolPrefix = 'just-scenario-tests';
const tmpPath = path.join(os.tmpdir(), ToolPrefix);
const toolsPath = path.join(__dirname, 'node_modules');

describe('create-just', () => {
  beforeEach(() => {
    if (fs.pathExistsSync(tmpPath)) {
      fs.removeSync(tmpPath);
    }
    fs.mkdirpSync(tmpPath);
  });

  it('can provision a monorepo', async () => {
    const results = await spawnAsync(
      process.execPath,
      [
        path.join(toolsPath, 'create-just/bin/create-just.js'),
        '-s',
        'just-stack-monorepo',
        'monorepo'
      ],
      { cwd: tmpPath }
    );

    expect(results.stdout).toContain('All Set!');
  }, 60000);

  it('can provision a single lib', async () => {
    const results = await spawnAsync(
      process.execPath,
      [
        path.join(toolsPath, 'create-just/bin/create-just.js'),
        '-s',
        'just-stack-single-lib',
        'singlelib'
      ],
      { cwd: tmpPath }
    );

    expect(results.stdout).toContain('All Set!');
  }, 60000);
});
