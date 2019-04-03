import fs from 'fs-extra';
import path from 'path';
import { spawnSync } from '../spawnSync';
import { tmpPath } from '../tmpPath';

const toolsPath = path.join(__dirname, '../../node_modules');

describe('create-just', () => {
  beforeEach(() => {
    if (fs.pathExistsSync(tmpPath)) {
      fs.removeSync(tmpPath);
    }
    fs.mkdirpSync(tmpPath);
  });

  it('can provision a monorepo', () => {
    const results = spawnSync(
      process.execPath,
      [
        path.join(toolsPath, 'create-just/bin/create-just.js'),
        '-s',
        'just-stack-monorepo',
        'monorepo'
      ],
      { cwd: tmpPath }
    );

    expect(results).toContain('All Set!');
  });

  it('can provision a single lib', () => {
    const results = spawnSync(
      process.execPath,
      [
        path.join(toolsPath, 'create-just/bin/create-just.js'),
        '-s',
        'just-stack-single-lib',
        'singlelib'
      ],
      { cwd: tmpPath }
    );

    expect(results).toContain('All Set!');
  });
});
