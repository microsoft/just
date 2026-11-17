import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { importModule } from '../importModule';
import { logger } from '../logger';

describe('importModule', () => {
  let tempRoot: string;

  beforeAll(() => {
    tempRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'just imports # % ')));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('preserves named and default exports from an ES module', async () => {
    const filePath = path.join(tempRoot, 'exports.mjs');
    fs.writeFileSync(filePath, 'export const value = 42; export default "default value";');

    const result = await importModule<{ value: number; default: string }>(filePath);

    expect(result.value).toBe(42);
    expect(result.default).toBe('default value');
  });

  it('preserves the default export of a CommonJS module', async () => {
    const filePath = path.join(tempRoot, 'exports.cjs');
    fs.writeFileSync(filePath, 'module.exports = { value: 42 };');

    const result = await importModule<{ default: { value: number } }>(filePath);

    expect(result.default).toEqual({ value: 42 });
  });

  it('resolves relative paths from the working directory', async () => {
    const filePath = path.join(tempRoot, 'relative.mjs');
    fs.writeFileSync(filePath, 'export const value = 42;');

    const result = await importModule(path.relative(process.cwd(), filePath));

    expect(result.value).toBe(42);
  });

  it('waits for top-level await', async () => {
    const filePath = path.join(tempRoot, 'async.mjs');
    fs.writeFileSync(filePath, 'export const value = await Promise.resolve(42);');

    const result = await importModule(filePath);

    expect(result.value).toBe(42);
  });

  it('logs the filename and underlying message without losing error details', async () => {
    const filePath = path.join(tempRoot, 'failure.mjs');
    fs.writeFileSync(filePath, 'const error = new Error("import failed"); error.code = "TEST_IMPORT"; throw error;');
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => undefined);

    await expect(importModule(filePath)).rejects.toMatchObject({
      message: 'import failed',
      code: 'TEST_IMPORT',
      stack: expect.stringContaining('failure.mjs'),
    });
    expect(errorSpy).toHaveBeenCalledWith(`Error importing "${filePath}": import failed`);
  });

  it('logs missing modules and preserves the failure', async () => {
    const filePath = path.join(tempRoot, 'missing.mjs');
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => undefined);

    await expect(importModule(filePath)).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(`Error importing "${filePath}":`));
  });

  it('preserves non-Error rejection values', async () => {
    const filePath = path.join(tempRoot, 'non-error.mjs');
    fs.writeFileSync(filePath, 'throw "string failure";');
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => undefined);

    await expect(importModule(filePath)).rejects.toBe('string failure');
    expect(errorSpy).toHaveBeenCalledWith(`Error importing "${filePath}": string failure`);
  });
});
