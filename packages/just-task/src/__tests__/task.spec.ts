import { describe, expect, it, jest, beforeAll, beforeEach } from '@jest/globals';
import { task } from '../task';
import { parallel, undertaker } from '../undertaker';
import { logger } from '../logger';
import path from 'path';
import * as option from '../option';
import UndertakerRegistry from 'undertaker-registry';

jest.mock('../option');

const mockArgv = option.argv as jest.MockedFunction<() => object>;

describe('task', () => {
  beforeAll(() => {
    jest.spyOn(logger, 'info').mockImplementation(() => undefined);
    mockArgv.mockReturnValue({ config: path.resolve(__dirname, '__mocks__/just-task.js') });
  });

  beforeEach(() => {
    undertaker.registry(new UndertakerRegistry());
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
});
