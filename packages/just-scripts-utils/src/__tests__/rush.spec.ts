import fs from 'fs';
import mockfs from 'mock-fs';
import jju from 'jju';
import { _justReadRushJson, _parseRushJson, rushAddPackage } from '../rush';

// TODO: test on Windows

const rushJsonStrNoProjects = `{
  // this is a comment
  "rushVersion": "5.5.4"
}`;
const rushJsonStr = `{
  // this is a comment
  "rushVersion": "5.5.4",
  "projects": [
    {
      "packageName": "a",
      "projectFolder": "packages/a"
    }
  ]
}`;
const rushJsonUpdatedStr = `{
  // this is a comment
  "rushVersion": "5.5.4",
  "projects": [
    {
      "packageName": "a",
      "projectFolder": "packages/a"
    },
    {
      "packageName": "b",
      "projectFolder": "packages/b"
    }
  ]
}`;

describe('rushUpdate', () => {
  // TOOD: not sure what to test here
});

describe('_justReadRushJson', () => {
  beforeAll(() => {
    mockfs({
      root: { 'rush.json': rushJsonStr },
      badRoot: {}
    });
  });

  afterAll(() => {
    mockfs.restore();
  });

  it('reads existing file', () => {
    expect(_justReadRushJson('root/rush.json')).toBe(rushJsonStr);
  });

  it('returns undefined for nonexistent file', () => {
    expect(_justReadRushJson('badRoot/rush.json')).toBeUndefined();
  });
});

describe('_parseRushJson', () => {
  it('handles invalid input', () => {
    expect(_justReadRushJson(undefined as any)).toBeUndefined();
    expect(_justReadRushJson('{')).toBeUndefined();
  });

  it('parses file', () => {
    const rushJsonParsed = jju.parse(rushJsonStr, { mode: 'cjson' });
    expect(_parseRushJson(rushJsonStr)).toEqual(rushJsonParsed);
  });
});

describe('readRushJson', () => {
  afterEach(() => {
    mockfs.restore();
    jest.restoreAllMocks();
  });

  it('handles invalid file', () => {
    const consoleError = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(consoleError);
    mockfs({
      root: { 'rush.json': '{' }
    });

    rushAddPackage('b', 'root');
    // console.error called
    expect(consoleError).toHaveBeenCalled();
    // rush.json not updated
    expect(fs.readFileSync('root/rush.json').toString()).toBe('{');
  });

  it('handles valid case', () => {
    // call this before mocking fs since it internally uses a dynamic require,
    // which doesn't work while fs is mocked (but if it's called before mocking,
    // the required file will be cached)
    jju.update('{}', {});

    mockfs({
      root1: { 'rush.json': rushJsonStrNoProjects }, // no projects yet
      root2: { 'rush.json': rushJsonStr } // already has a project
    });

    rushAddPackage('a', 'root1');
    expect(fs.readFileSync('root1/rush.json').toString()).toBe(rushJsonStr);

    rushAddPackage('b', 'root2');
    expect(fs.readFileSync('root2/rush.json').toString()).toBe(rushJsonUpdatedStr);
  });

  it('handles update or write errors', () => {
    jju.update('{}', {});
    const consoleError = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(consoleError);
    const throwError = () => {
      throw new Error('error');
    };

    mockfs({
      root: { 'rush.json': rushJsonStr }
    });

    // cause a fake update error
    jest.spyOn(jju, 'update', 'get').mockImplementationOnce(throwError);
    rushAddPackage('b', 'root');
    expect(consoleError).toHaveBeenCalled();
    expect(fs.readFileSync('root/rush.json').toString()).toEqual(rushJsonStr);

    // cause a fake write error
    consoleError.mockClear();
    jest.spyOn(fs, 'writeFileSync').mockImplementation(throwError);
    rushAddPackage('b', 'root');
    expect(consoleError).toHaveBeenCalled();
    expect(fs.readFileSync('root/rush.json').toString()).toEqual(rushJsonStr);
  });
});
