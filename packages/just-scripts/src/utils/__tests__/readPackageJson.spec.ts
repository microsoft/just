import { readPackageJson } from '../readPackageJson';
import * as mockfs from 'mock-fs';

describe('readPackageJson', () => {
  const testDir = 'testDir';
  const badDir = 'badDir';
  const testName = 'my-fake-package';

  beforeEach(() => {
    mockfs({
      [testDir]: {
        'package.json': JSON.stringify({ name: testName }),
      },
      [badDir]: {
        'package.json': '{', // invalid JSON
      },
    });
  });

  afterEach(() => {
    // As of jest 27, it seems that sometimes if fs isn't restored after each test, there's an
    // error in the result reporting code that tries to load jest-worker.
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
