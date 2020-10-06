import mockfs = require('mock-fs');
import { paths } from '../paths';
import { findMonoRepoRootPath } from '../findMonoRepoRootPath';

describe('findMonoRepoRootPath', () => {
  const packageJsonWithJustStack = JSON.stringify({ just: { stack: 'just-stack-monorepo' } });
  const packageJsonWithWrongStack = JSON.stringify({ just: { stack: 'no' } });

  afterEach(() => {
    paths.projectPath = '';
    mockfs.restore();
  });

  it('returns null when there is no monorepo root', () => {
    mockfs({
      '/a': {},
      '/b/c/d': {},
      '/e': {
        'package.json': '{}', // no just.stack
        f: {
          'package.json': packageJsonWithWrongStack,
          g: {}
        }
      },
      '/h': {
        i: {}, // this will be the projectPath
        j: { 'rush.json': '{}' } // rush.json is in the wrong place
      }
    });

    paths.projectPath = '/a';
    expect(findMonoRepoRootPath()).toBeNull();

    paths.projectPath = '/b/c/d';
    expect(findMonoRepoRootPath()).toBeNull();

    paths.projectPath = '/e/f/g';
    expect(findMonoRepoRootPath()).toBeNull();

    paths.projectPath = '/h/i';
    expect(findMonoRepoRootPath()).toBeNull();
  });

  it('works when projectPath is the monorepo root', () => {
    mockfs({
      '/a': { 'rush.json': '{}' },
      '/b': { 'package.json': packageJsonWithJustStack }
    });

    paths.projectPath = '/a';
    expect(findMonoRepoRootPath()).toBe('/a');

    paths.projectPath = '/b';
    expect(findMonoRepoRootPath()).toBe('/b');
  });

  it('works in a general case with rush.json at root', () => {
    mockfs({
      '/a/b': {
        'rush.json': '{}', // real root
        c: {
          'package.json': '{', // invalid json
          d: {
            'package.json': packageJsonWithWrongStack,
            e: {}
          }
        }
      }
    });

    paths.projectPath = '/a/b/c/d/e';
    expect(findMonoRepoRootPath()).toBe('/a/b');
  });

  it('works in a general case with package.json with just.stack at root', () => {
    mockfs({
      '/a/b': {
        'rush.json': packageJsonWithJustStack, // real root
        c: {
          'package.json': '{', // invalid json
          d: {
            'package.json': packageJsonWithWrongStack,
            e: {}
          }
        }
      }
    });

    paths.projectPath = '/a/b/c/d/e';
    expect(findMonoRepoRootPath()).toBe('/a/b');
  });
});
