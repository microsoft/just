jest.mock('yargs');

import { task } from '../task';
import { parallel, undertaker } from '../undertaker';
import { JustTaskRegistry } from '../JustTaskRegistry';
import yargs from 'yargs';
import path from 'path';

describe('task', () => {
  beforeEach(() => {
    const yargsBuilder = yargs;
    yargsBuilder.option('config', { default: path.resolve(__dirname, '__mocks__/just-task.js') });
    undertaker.registry(new JustTaskRegistry());
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
      let result = testFunction();
      return Promise.resolve(result);
    });

    parallel('test')(function() {
      expect(testFunction).toBeCalledTimes(1);
      done();
    });
  });
});
