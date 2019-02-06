import mockfs from 'mock-fs';
import { readPackageJson } from '../readPackageJson';

describe('readPackageJson', () => {
  const testDir = 'testDir';
  const testName = 'my-fake-package';

  beforeAll(() => {
    mockfs({
      [testDir]: {
        'package.json': JSON.stringify({ name: testName })
      }
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
});
