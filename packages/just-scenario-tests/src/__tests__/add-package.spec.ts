import fs from 'fs-extra';
import path from 'path';
import { getTempPath } from '../getTempPath';
import { runNode, runNpm } from '../tools';
import { link } from '../link';

const toolsPath = path.join(__dirname, '../../node_modules');
const rootPath = path.join(__dirname, '../../../..');

describe('add-package', () => {
  const tmpPath = getTempPath('add-package');
  beforeEach(() => {
    if (fs.pathExistsSync(getTempPath('add-package'))) {
      fs.removeSync(tmpPath);
    }
    fs.mkdirpSync(tmpPath);
  });

  it('can add a package to a monorepo', () => {
    runNode([path.join(toolsPath, 'create-just/bin/create-just.js'), '-s', 'just-stack-monorepo'], tmpPath);

    link(tmpPath, rootPath);

    const results = runNpm(['run', 'add-package', '--', '--', '-n', 'newlib', '-s', 'just-stack-single-lib'], tmpPath);

    expect(results).toContain('All Set!');
    expect(fs.pathExistsSync(path.join(tmpPath, 'packages', 'newlib'))).toBeTruthy();
  });
});
