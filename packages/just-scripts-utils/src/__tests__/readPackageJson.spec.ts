import { readPackageJson } from '../readPackageJson';
import mockfs = require('mock-fs');

describe('readPackageJson', () => {
  const testDir = 'testDir';
  const badDir = 'badDir';
  const testName = 'my-fake-package';

  beforeAll(() => {
    mockfs({
      [testDir]: {
        'package.json': JSON.stringify({ name: testName }),
      },
      [badDir]: {
        'package.json': '{', // invalid JSON
      },
    });
  });

  afterAll(() => {
    mockfs.restore();
  });

  it('returns undefined for non-existent file', () => {
    expect(readPackageJson('asdf')).toBeUndefined();
  });

  it('reads existing file', () => {
    const packageJson = readPackageJson(testDir);
    expect(packageJson).toBeDefined();
    expect(packageJson!.name).toEqual(testName);
  });

  it('returns undefined for invalid json', () => {
    const packageJson = readPackageJson(badDir);
    expect(packageJson).toBeUndefined();
  });
});
