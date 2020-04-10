import { task } from '../task';
import { parallel, undertaker } from '../undertaker';
import UndertakerRegistry from 'undertaker-registry';

import { logger } from '../logger';
import yargsMock from './__mocks__/yargs';
import path from 'path';

describe('task', () => {
  beforeAll(() => {
    yargsMock.argv.config = path.resolve(__dirname, '__mocks__/just-task.js');
    jest.spyOn(logger, 'info').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    undertaker.registry(new UndertakerRegistry());
  });

  afterAll(() => {
    yargsMock.argv.config = undefined;
    jest.restoreAllMocks();
  });

  it('allows synchronous tasks to be defined and be run', done => {
    const testFunction = jest.fn(() => {});

    task('test', function() {
      testFunction();
    });

    parallel('test')(function() {
      expect(testFunction).toBeCalledTimes(1);
      done();
    });
  });

  it('allows callback-based tasks to be defined and be run', done => {
    const testFunction = jest.fn(() => {});

    task('test', function(cb) {
      testFunction();
      cb();
    });

    parallel('test')(function() {
      expect(testFunction).toBeCalledTimes(1);
      done();
    });
  });

  it('allows promise-based tasks to be defined and be run', done => {
    const testFunction = jest.fn(() => {});

    task('test', function() {
      const result = testFunction();
      return Promise.resolve(result);
    });

    parallel('test')(function() {
      expect(testFunction).toBeCalledTimes(1);
      done();
    });
  });
});
