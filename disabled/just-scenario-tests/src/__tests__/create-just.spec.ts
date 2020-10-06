import * as fs from 'fs-extra';
import * as path from 'path';
import { getTempPath } from '../getTempPath';
import { runNode } from '../tools';

const toolsPath = path.join(__dirname, '../../node_modules');

describe('create-just', () => {
  const tmpPath = getTempPath('create-just');

  beforeEach(() => {
    if (fs.pathExistsSync(tmpPath)) {
      fs.removeSync(tmpPath);
    }
    fs.mkdirpSync(tmpPath);
  });

  it('can provision a monorepo', () => {
    const results = runNode([path.join(toolsPath, 'create-just/bin/create-just.js'), '-s', 'just-stack-monorepo', 'monorepo'], tmpPath);
    expect(results).toContain('All Set!');
  });

  it('can provision a single lib', () => {
    const results = runNode([path.join(toolsPath, 'create-just/bin/create-just.js'), '-s', 'just-stack-single-lib', 'singlelib'], tmpPath);
    expect(results).toContain('All Set!');
  });
});
