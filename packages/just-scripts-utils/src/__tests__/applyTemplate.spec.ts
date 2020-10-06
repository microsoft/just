import * as fse from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import { _processFileFromTemplate, _writeHbsFile, applyTemplate } from '../applyTemplate';
import { logger } from '../logger';
import mockfs = require('mock-fs');

// Example handlebars templates
const helloTemplate = 'Hello {{name}}';
const badHelloTemplate = 'Hello {{name}'; // missing }

// Helpers for mocking logger.warn/error and recording the most recent arg.
// Not all tests use these.
let lastWarning: any;
let lastError: any;
const fakeWarn = jest.fn(arg => (lastWarning = arg));
const fakeError = jest.fn(arg => (lastError = arg));
function clearFakeWarnError() {
  lastWarning = undefined;
  lastError = undefined;
  fakeWarn.mockClear();
  fakeError.mockClear();
}

// Helper for failing a test on console.warn/error. This is called before all the tests.
// (Tests expecting log output can override these mocks.)
function throwOnWarnOrError() {
  function throwArgs(...args: any[]) {
    throw new Error(args.join(' '));
  }

  jest.spyOn(console, 'warn').mockImplementation(throwArgs);
  jest.spyOn(console, 'error').mockImplementation(throwArgs);
}

// Helper that throws an error. Used as a mock implementation to make particular methods throw.
const thrownErrorMsg = 'oh no';
function throwError(): string[] {
  throw new Error(thrownErrorMsg);
}

describe('_writeHbsFile', () => {
  beforeEach(() => {
    throwOnWarnOrError();
  });

  afterEach(() => {
    mockfs.restore();
    jest.restoreAllMocks();
  });

  it('handles normal case', () => {
    mockfs({
      template: { a: { 'test.txt.hbs': helloTemplate } },
      project: { a: {} }
    });

    _writeHbsFile('template/a/test.txt.hbs', 'project/a/test.txt.hbs', { name: 'world' });
    // wrote the right file (no .hbs extension)
    expect(fse.existsSync('project/a/test.txt')).toBe(true);
    // compiled template properly
    expect(fse.readFileSync('project/a/test.txt').toString()).toBe('Hello world');
  });

  it('throws on invalid template', () => {
    jest.spyOn(fse, 'readFileSync').mockReturnValueOnce(badHelloTemplate);
    expect(() => {
      _writeHbsFile('template/test.txt.hbs', 'project/test.txt.hbs', { name: 'world' });
    }).toThrow(/Parse error/);
  });

  it('throws on write error', () => {
    jest.spyOn(fse, 'readFileSync').mockReturnValueOnce(helloTemplate);
    jest.spyOn(fse, 'writeFileSync').mockImplementationOnce(throwError as any);
    expect(() => {
      _writeHbsFile('template/test.txt.hbs', 'project/test.txt.hbs', { name: 'world' });
    }).toThrow(new RegExp(thrownErrorMsg));
  });
});

describe('_processFileFromTemplate', () => {
  beforeEach(() => {
    throwOnWarnOrError();
  });

  afterEach(() => {
    mockfs.restore();
    jest.restoreAllMocks();
    clearFakeWarnError();
  });

  it('handles nonexistent input file', () => {
    mockfs({
      template: {},
      project: {}
    });
    jest.spyOn(logger, 'warn').mockImplementation(fakeWarn);

    const result = _processFileFromTemplate('template/foo', 'template', 'project');
    expect(fakeWarn).toHaveBeenCalledTimes(1);
    expect(lastWarning).toContain('does not exist');
    expect(result).toBe(false);
  });

  it('handles error stat-ing input file', () => {
    mockfs({
      template: { 'foo.txt': '' },
      project: {}
    });
    jest.spyOn(logger, 'warn').mockImplementation(fakeWarn);
    jest.spyOn(fse, 'statSync').mockImplementationOnce(throwError as any);

    const result = _processFileFromTemplate('foo.txt', 'template', 'project');
    expect(fakeWarn).toHaveBeenCalledTimes(1);
    expect(lastWarning).toContain('Error processing template');
    expect(lastWarning).toContain(thrownErrorMsg);
    expect(result).toBe(false);
  });

  it('handles directory', () => {
    mockfs({
      'template/a/b': { 'foo.txt': '' },
      project: {}
    });

    const result = _processFileFromTemplate('a/b', 'template', 'project');
    expect(result).toBe(true);
    expect(fse.existsSync('project/a/b')).toBe(true);
    expect(fse.readdirSync('project/a/b')).toHaveLength(0); // didn't copy content
  });

  it('handles directory that already exists in dest', () => {
    mockfs({
      'template/a/b': {},
      'project/a/b': { 'foo.txt': '' }
    });

    const result = _processFileFromTemplate('a/b', 'template', 'project');
    expect(result).toBe(true);
    expect(fse.existsSync('project/a/b')).toBe(true);
  });

  it('handles non-template file', () => {
    mockfs({
      // The fake file content is actually a valid handlebars template here, but it should
      // be written back unchanged since it doesn't have the .hbs extension
      template: { 'foo.txt': helloTemplate },
      project: {}
    });

    const result = _processFileFromTemplate('foo.txt', 'template', 'project');
    expect(result).toBe(true);
    expect(fse.existsSync('project/foo.txt')).toBe(true);
    expect(fse.readFileSync('project/foo.txt').toString()).toBe(helloTemplate);
  });

  it('handles non-template file that already exists in dest', () => {
    mockfs({
      template: { 'foo.txt': 'test' },
      project: { 'foo.txt': 'old' }
    });

    const result = _processFileFromTemplate('foo.txt', 'template', 'project');
    expect(result).toBe(true);
    expect(fse.existsSync('project/foo.txt')).toBe(true);
    expect(fse.readFileSync('project/foo.txt').toString()).toBe('test');
  });

  it('handles template file', () => {
    mockfs({
      template: { 'test.txt.hbs': helloTemplate },
      project: {}
    });

    const result = _processFileFromTemplate('test.txt.hbs', 'template', 'project', {
      name: 'world'
    });
    expect(result).toBe(true);
    expect(fse.existsSync('project/test.txt')).toBe(true);
    expect(fse.readFileSync('project/test.txt').toString()).toBe('Hello world');
  });

  it('skips invalid template file', () => {
    mockfs({
      template: { 'test.txt.hbs': badHelloTemplate },
      project: {}
    });
    jest.spyOn(logger, 'warn').mockImplementation(fakeWarn);

    const result = _processFileFromTemplate('test.txt.hbs', 'template', 'project', {
      name: 'world'
    });
    expect(result).toBe(false);
    expect(fakeWarn).toHaveBeenCalledTimes(1);
    expect(lastWarning).toContain('Error processing template');
    expect(lastWarning).toContain('Parse error');
    expect(fse.existsSync('project/test.txt')).toBe(false);
  });

  it('handles template file that already exists in dest', () => {
    mockfs({
      template: { 'test.txt.hbs': helloTemplate },
      project: { 'test.txt': 'old' }
    });

    const result = _processFileFromTemplate('test.txt.hbs', 'template', 'project', {
      name: 'world'
    });
    expect(result).toBe(true);
    expect(fse.existsSync('project/test.txt')).toBe(true);
    expect(fse.readFileSync('project/test.txt').toString()).toBe('Hello world');
  });

  it('skips existing dir with same name as incoming file', () => {
    mockfs({
      template: { a: 'hi' },
      project: { a: {} }
    });
    jest.spyOn(logger, 'warn').mockImplementation(fakeWarn);

    const result = _processFileFromTemplate('a', 'template', 'project');
    expect(result).toBe(false);
    expect(fakeWarn).toHaveBeenCalledTimes(1);
    expect(fse.existsSync('project/a')).toBe(true);
    expect(fse.statSync('project/a').isDirectory()).toBe(true);
  });

  it('skips existing file with same name as incoming dir', () => {
    mockfs({
      template: { a: {} },
      project: { a: 'hi' }
    });
    jest.spyOn(logger, 'warn').mockImplementation(fakeWarn);

    const result = _processFileFromTemplate('a', 'template', 'project');
    expect(result).toBe(false);
    expect(fakeWarn).toHaveBeenCalledTimes(1);
    expect(fse.existsSync('project/a')).toBe(true);
    expect(fse.statSync('project/a').isDirectory()).toBe(false);
  });
});

describe('applyTemplate', () => {
  beforeEach(() => {
    throwOnWarnOrError();
  });

  afterEach(() => {
    mockfs.restore();
    jest.restoreAllMocks();
    clearFakeWarnError();
  });

  it('handles glob errors', () => {
    jest.spyOn(logger, 'error').mockImplementation(fakeError);
    jest.spyOn(glob, 'sync').mockImplementationOnce(throwError);

    const result = applyTemplate('template', 'project');
    expect(result).toEqual({ error: true, processed: 0, warnings: 0 });
    expect(lastError).toContain('Error finding template files');
    expect(lastError).toContain(thrownErrorMsg);
  });

  it('creates dest if needed', () => {
    mockfs({
      template: {}
    });

    const result = applyTemplate('template', 'project');
    expect(fse.existsSync('project')).toBe(true);
    expect(result).toEqual({ processed: 0, warnings: 0 });
  });

  it('handles error creating dest', () => {
    jest.spyOn(logger, 'error').mockImplementation(fakeError);
    jest.spyOn(fse, 'existsSync').mockReturnValueOnce(false);
    jest.spyOn(fse, 'mkdirpSync').mockImplementationOnce(throwError);

    const result = applyTemplate('template', 'project');
    expect(result).toEqual({ error: true, processed: 0, warnings: 0 });
    expect(lastError).toContain(`Couldn't create directory`);
    expect(lastError).toContain(thrownErrorMsg);
  });

  it('handles dot files', () => {
    mockfs({
      template: {
        '.DS_Store': '', // will be filtered out
        '.gitignore': ''
      }
    });

    const result = applyTemplate('template', 'project');
    expect(result).toEqual({ processed: 1, warnings: 0 });
    expect(fse.existsSync('project')).toBe(true);
    expect(fse.existsSync('project/.DS_Store')).toBe(false);
    expect(fse.existsSync('project/.gitignore')).toBe(true);
  });

  it('keeps extra files in dest', () => {
    mockfs({
      template: { 'foo.txt': '' },
      project: { 'bar.txt': '', a: {} }
    });

    const result = applyTemplate('template', 'project');
    expect(result).toEqual({ processed: 1, warnings: 0 });
    expect(fse.existsSync('project/foo.txt')).toBe(true);
    expect(fse.existsSync('project/bar.txt')).toBe(true);
    expect(fse.existsSync('project/a')).toBe(true);
  });

  it('handles general case', () => {
    // Build an object like the input to mockfs() representing the given directory's tree
    // (used to test the result)
    function directoryTree(dir: string) {
      const result: any = {};
      const children = fse.readdirSync(dir);
      for (const child of children) {
        const childPath = path.join(dir, child);
        const childStats = fse.statSync(childPath);
        if (childStats.isDirectory()) {
          result[child] = directoryTree(childPath);
        } else {
          result[child] = fse.readFileSync(childPath).toString();
        }
      }
      return result;
    }

    mockfs({
      template: {
        '.gitignore': '',
        a: {
          'b.txt.hbs': helloTemplate,
          'c.txt': 'hi',
          d: {
            '.DS_Store': '',
            'e.txt.hbs': badHelloTemplate,
            f: {}
          }
        }
      },
      project: {
        'g.txt': '',
        a: {
          'b.txt': 'old', // contents will be updated
          d: {
            f: 'hi' // this will be left as-is since it's a dir in the template
          }
        }
      }
    });
    jest.spyOn(logger, 'warn').mockImplementation(fakeWarn);

    const result = applyTemplate('template', 'project', { name: 'world' });
    expect(directoryTree('project')).toEqual({
      '.gitignore': '',
      'g.txt': '',
      a: {
        'b.txt': 'Hello world',
        'c.txt': 'hi',
        d: {
          f: 'hi'
        }
      }
    });
    expect(result).toEqual({ processed: 3, warnings: 1 });
  });
});
