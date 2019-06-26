/*eslint @typescript-eslint/camelcase: ["error", {allow: ["child_process"]}]*/
import mockfs from 'mock-fs';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import tar from 'tar';
import { paths } from '../paths';
import { logger } from '../logger';
import { _isDevMode, downloadPackage, _setMockDirname } from '../downloadPackage';

describe('downloadPackage', () => {
  /**
   * Final part of the directory containing the built version of downloadPackage.ts.
   * We use this various places to set a fake __dirname for the built downloadPackage.js.
   * This should ideally be kept in sync with the actual package name and output location.
   */
  const libDir = 'just-scripts-utils/lib';

  const fakeTemp = 'temp';
  const fakeLoggerError = jest.fn();

  beforeAll(() => {
    jest.spyOn(paths, 'tempPath').mockImplementation(pkg => {
      return path.join(fakeTemp, pkg);
    });
    // prevent logged errors from failing tests
    jest.spyOn(logger, 'error').mockImplementation(fakeLoggerError);
  });

  afterEach(() => {
    _setMockDirname('');
    mockfs.restore();
    fakeLoggerError.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('correctly detects dev mode in real repo', () => {
    // real package in real directory structure
    expect(_isDevMode('just-stack-monorepo')).toBe(true);
    // this package doesn't exist
    expect(_isDevMode('foo')).toBe(false);
  });

  it('correctly detects not dev mode', () => {
    const libInNodeModules = path.join('foo/node_modules', libDir);
    mockfs({
      // almost a realistic "dev mode" case but has the wrong package name
      'just-task': {
        'package.json': JSON.stringify({ name: 'not-just-task' }),
        packages: {
          [libDir]: {},
          'foo/template': {}
        }
      },
      // another case simulating being installed in node_modules
      [libInNodeModules]: {}
    });

    _setMockDirname('not-just-task/packages/just-scripts-utils/lib');
    expect(_isDevMode('foo')).toBe(false);

    _setMockDirname(libInNodeModules);
    expect(_isDevMode('foo')).toBe(false);
  });

  it('returns local template path in dev mode', async () => {
    const pkg = 'just-stack-monorepo';
    const result = await downloadPackage(pkg);
    expect(result).toBe(path.join(__dirname, '../../..', pkg, 'template'));
  });

  it('removes previous download and handles npm pack errors', async () => {
    const pkg = 'foo';
    const tempPath = `${fakeTemp}/${pkg}`;
    mockfs({
      [tempPath]: {
        'file.txt': 'stuff'
      }
    });
    // cause npm pack to "error"
    jest.spyOn(child_process, 'spawnSync').mockImplementationOnce(
      (cmd: string, args?: readonly string[]): ReturnType<typeof child_process.spawnSync> => {
        expect(args).toContain(`${pkg}@latest`);
        return { error: new Error('fail'), pid: 100, output: [], signal: '', status: 1, stderr: Buffer.from(''), stdout: Buffer.from('') };
      }
    );

    const result = await downloadPackage(pkg);

    // old directory contents got deleted
    expect(fs.existsSync(path.join(tempPath, 'file.txt'))).toBe(false);
    // directory got re-created
    expect(fs.existsSync(tempPath)).toBe(true);

    // npm pack "errored"
    expect(result).toBeNull();
    expect(fakeLoggerError).toBeCalled();
  });

  it('downloads package', async () => {
    const pkg = 'foo';
    const version = '1.2.3';
    mockfs({
      [fakeTemp]: {},
      // this will be tar'd up by fake npm pack below
      [`${pkg}/package/template`]: {
        'file.txt': 'stuff'
      }
    });

    // fake the result of npm pack
    jest.spyOn(child_process, 'spawnSync').mockImplementationOnce((cmd: string, args?: readonly string[]) => {
      expect(args).toContain(`${pkg}@${version}`);
      // instead of downloading a tarball, create one in the expected spot
      tar.create({ sync: true, gzip: true, file: path.join(fakeTemp, pkg, 'result.tgz') }, [pkg]);
      return { pid: 100, output: [], signal: '', status: 0, stderr: Buffer.from(''), stdout: Buffer.from('') };
    });

    const result = await downloadPackage(pkg, version);
    expect(result).toBe(path.join(fakeTemp, pkg, 'package/template'));
  });
});
