import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { task } from '../task';
import { parallel, undertaker } from '../undertaker';
import { logger } from '../logger';
import * as option from '../option';
import configFactory from './__mocks__/just.config';

jest.mock('../option');

const mockArgv = option.argv as jest.MockedFunction<() => object>;
const mockLoggerInfo = jest.spyOn(logger, 'info').mockImplementation(() => undefined);
jest.spyOn(logger, 'error').mockImplementation(() => undefined);

describe('task', () => {
  /** Run a registered task by name and resolve/reject when it completes. */
  function runTask(name: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      parallel(name)((err?: Error | null) => (err ? reject(err) : resolve()));
    });
  }

  beforeEach(() => {
    // Fully clear the registry. There's no public API to do this, and undertaker.registry()
    // copies tasks into the new registry, so clear the internal `_tasks` record.
    (undertaker.registry() as unknown as { _tasks: Record<string, unknown> })._tasks = {};
  });

  it('allows synchronous tasks to be defined and be run', done => {
    const testFunction = jest.fn(() => undefined);

    task('test', function () {
      testFunction();
    });

    parallel('test')(function () {
      expect(testFunction).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('allows callback-based tasks to be defined and be run', done => {
    const testFunction = jest.fn(() => undefined);

    task('test', function (cb) {
      testFunction();
      cb();
    });

    parallel('test')(function () {
      expect(testFunction).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('allows promise-based tasks to be defined and be run', done => {
    const testFunction = jest.fn(() => undefined);

    task('test', function () {
      const result = testFunction();
      return Promise.resolve(result);
    });

    parallel('test')(function () {
      expect(testFunction).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('with config factory', () => {
    beforeEach(() => {
      // The outer beforeEach already reset the registry; re-register the config's tasks.
      mockArgv.mockReturnValue({ _: [], $0: 'just' });

      configFactory();
    });

    afterEach(() => {
      // A failing task sets process.exitCode = 1 via the undertaker error handler; reset it so
      // the test process still exits cleanly.
      process.exitCode = 0;
      jest.clearAllMocks();
    });

    it('registers all of the config tasks', () => {
      const taskNames = Object.keys(undertaker.registry().tasks()).sort();
      expect(taskNames).toEqual([
        'build',
        'clean',
        'cond',
        'default',
        'eslint',
        'ts',
        'webpack',
        'webpack:promise',
        'webpack:promise:fail',
      ]);
    });

    it('runs a synchronous task with a description', async () => {
      expect(undertaker.task('clean')?.unwrap().description).toBe('this is cleaning');

      await runTask('clean');

      expect(mockLoggerInfo).toHaveBeenCalledWith('fake cleaning up the build and lib and dist folders');
    });

    it('runs a task that returns a callback-style function (webpack)', async () => {
      await runTask('webpack');

      expect(mockLoggerInfo).toHaveBeenCalledWith('fake webpack bundling files', expect.any(Number));
    });

    it('runs a task that returns a promise directly (webpack:promise)', async () => {
      await runTask('webpack:promise');

      expect(mockLoggerInfo).toHaveBeenCalledWith('fake webpack bundling files', expect.any(Number));
    });

    it('rejects when a task returns a function producing a rejected promise (webpack:promise:fail)', async () => {
      await expect(runTask('webpack:promise:fail')).rejects.toThrow('adsfadsf');
    });

    it('runs a composite build task (parallel + series)', async () => {
      await runTask('build');

      expect(mockLoggerInfo).toHaveBeenCalledWith('fake linting with eslint');
      expect(mockLoggerInfo).toHaveBeenCalledWith('fake cleaning up the build and lib and dist folders');
      expect(mockLoggerInfo).toHaveBeenCalledWith('fake building with typescript');
      expect(mockLoggerInfo).toHaveBeenCalledWith('fake webpack bundling files', expect.any(Number));
    });

    it('skips the conditional typescript task when not in production (cond)', async () => {
      mockArgv.mockReturnValue({ _: [], $0: 'just', production: false });

      await runTask('cond');

      expect(mockLoggerInfo).not.toHaveBeenCalledWith('fake building with typescript');
      expect(mockLoggerInfo).toHaveBeenCalledWith('fake linting with eslint');
    });

    it('runs the conditional typescript task when in production (cond)', async () => {
      mockArgv.mockReturnValue({ _: [], $0: 'just', production: true });

      await runTask('cond');

      expect(mockLoggerInfo).toHaveBeenCalledWith('fake building with typescript');
    });

    it('runs the default task', async () => {
      mockArgv.mockReturnValue({ _: [], $0: 'just', production: true });

      await runTask('default');

      expect(mockLoggerInfo).toHaveBeenCalledWith('fake building with typescript');
      expect(mockLoggerInfo).toHaveBeenCalledWith('fake webpack bundling files', expect.any(Number));
    });
  });
});
