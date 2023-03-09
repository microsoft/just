import { task } from '../task';
import { parallel, undertaker } from '../undertaker';
import { logger } from '../logger';
import * as path from 'path';
import * as option from '../option';
import * as UndertakerRegistry from 'undertaker-registry';

describe('task', () => {
  beforeAll(() => {
    jest
      .spyOn(option, 'argv')
      .mockImplementation(() => ({ config: path.resolve(__dirname, '__mocks__/just-task.js') } as any));
    jest.spyOn(logger, 'info').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    undertaker.registry(new UndertakerRegistry());
  });

  afterAll(() => {
    jest.spyOn(option, 'argv').mockImplementation(() => ({ config: 'a/just-task.js' } as any));
    jest.restoreAllMocks();
  });

  it('allows synchronous tasks to be defined and be run', done => {
    const testFunction = jest.fn(() => undefined);

    task('test', function () {
      testFunction();
    });

    parallel('test')(function () {
      expect(testFunction).toBeCalledTimes(1);
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
      expect(testFunction).toBeCalledTimes(1);
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
      expect(testFunction).toBeCalledTimes(1);
      done();
    });
  });
});
