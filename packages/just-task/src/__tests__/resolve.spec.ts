import mockfs from 'mock-fs';
import path from 'path';
import { _isFileNameLike, _tryResolve, resetResolvePaths, resolveCwd, addResolvePath, resolve } from '../resolve';

import * as option from '../option';

describe('_isFileNameLike', () => {
  it('returns false for empty input', () => {
    expect(_isFileNameLike('')).toBe(false);
    expect(_isFileNameLike(undefined as any)).toBe(false);
    expect(_isFileNameLike(null as any)).toBe(false);
  });

  it('returns true for filenames', () => {
    expect(_isFileNameLike('.')).toBe(true);
    expect(_isFileNameLike('.gitignore')).toBe(true);
    expect(_isFileNameLike('foo.js')).toBe(true);
  });

  it('returns false for possible non-filenames', () => {
    expect(_isFileNameLike('foo')).toBe(false);
  });

  it('returns false for names with separators', () => {
    expect(_isFileNameLike('foo/bar')).toBe(false);
    expect(_isFileNameLike('foo\\bar')).toBe(false);
    expect(_isFileNameLike('foo/bar.txt')).toBe(false);
    expect(_isFileNameLike('foo\\bar.txt')).toBe(false);
  });
});

describe('_tryResolve', () => {
  afterEach(() => {
    mockfs.restore();
  });

  it('does not throw', () => {
    expect(_tryResolve('foo', 'bar')).toBeNull();
    expect(_tryResolve(undefined as any, undefined as any)).toBeNull();
  });

  it('does not recurse into child dirs', () => {
    mockfs({
      a: { 'b.txt': '' }
    });
    expect(_tryResolve('b.txt', process.cwd())).toBeNull();
  });

  it('resolves filename relative to basedir', () => {
    mockfs({
      a: { 'b.txt': '' }, // right
      'b.txt': '' // wrong
    });
    expect(_tryResolve('b.txt', 'a')).toContain(path.join('a', 'b.txt'));
  });

  it('resolves non-filename relative to node_modules in basedir', () => {
    mockfs({
      a: {
        'b.js': '', // wrong
        // eslint-disable-next-line @typescript-eslint/camelcase
        node_modules: { 'b.js': '' } // right
      },
      // eslint-disable-next-line @typescript-eslint/camelcase
      node_modules: { 'b.js': '' } // wrong
    });
    expect(_tryResolve('b', 'a')).toContain(path.join('a', 'node_modules', 'b.js'));
  });

  it('resolves path with /', () => {
    mockfs({
      // eslint-disable-next-line @typescript-eslint/camelcase
      a: { node_modules: { b: { 'c.js': '' } } }
    });
    expect(_tryResolve('b/c', 'a')).toContain(path.join('a', 'node_modules', 'b', 'c.js'));
  });
});

describe('resolveCwd', () => {
  beforeEach(() => {
    jest.spyOn(option, 'argv').mockImplementation(() => ({ config: undefined } as any));
  });

  afterEach(() => {
    mockfs.restore();
    resetResolvePaths();
  });

  // Not testing this one extensively since it's basically a pass-through to _tryResolve

  it('defaults to searching relative to process cwd', () => {
    mockfs({
      a: { 'b.txt': '' }, // right
      'b.txt': '' // wrong
    });
    jest.spyOn(process, 'cwd').mockReturnValueOnce('a');
    expect(resolveCwd('b.txt')).toContain(path.join('a', 'b.txt'));
  });

  it('uses provided cwd', () => {
    mockfs({
      a: { 'b.txt': '' }, // right
      'b.txt': '' // wrong
    });
    expect(resolveCwd('b.txt', 'a')).toContain(path.join('a', 'b.txt'));
  });

  it('ignores resolvePaths', () => {
    mockfs({
      a: { 'b.txt': '' }
    });
    addResolvePath('a');
    expect(resolveCwd('b.txt')).toBeNull();
  });
});

describe('resolve', () => {
  jest.spyOn(option, 'argv').mockImplementation(() => ({ config: undefined } as any));

  afterEach(() => {
    mockfs.restore();
    resetResolvePaths();
  });

  it('defaults to searching relative to process cwd', () => {
    mockfs({
      a: { 'b.txt': '' }, // right
      'b.txt': '' // wrong
    });
    jest.spyOn(process, 'cwd').mockReturnValueOnce('a');
    expect(resolve('b.txt')).toContain(path.join('a', 'b.txt'));
  });

  it('uses provided cwd', () => {
    mockfs({
      a: { 'b.txt': '' }, // right
      'b.txt': '', // wrong
      c: { 'b.txt': '' }
    });
    expect(resolve('b.txt', 'a')).toContain(path.join('a', 'b.txt'));
  });

  it('uses dirname of --config arg', () => {
    mockfs({
      a: { 'b.txt': '' }
    });

    jest.spyOn(option, 'argv').mockImplementation(() => ({ config: 'a/just-task.js' } as any));

    expect(resolve('b.txt')).toContain(path.join('a', 'b.txt'));
  });

  it('uses resolvePaths for file', () => {
    mockfs({
      a: {},
      c: { 'b.txt': '' }
    });
    addResolvePath('a');
    addResolvePath('c');
    expect(resolve('b.txt')).toContain(path.join('c', 'b.txt'));
  });

  it('prefers provided cwd', () => {
    mockfs({
      a: { 'b.txt': '' }, // right
      c: { 'b.txt': '' }, // wrong
      d: { 'b.txt': '' }, // wrong
      'b.txt': '' // wrong
    });

    jest.spyOn(option, 'argv').mockImplementation(() => ({ config: 'a/just-task.js' } as any));

    addResolvePath('c');
    expect(resolve('b.txt', 'd')).toContain(path.join('d', 'b.txt'));
  });
});
