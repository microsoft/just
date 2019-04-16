import { task } from '../task';
import { parallel, undertaker, series } from '../undertaker';
import { JustTaskRegistry } from '../JustTaskRegistry';
import { logger } from '../logger';
import yargsMock from './__mocks__/yargs';
import path from 'path';

describe('task', () => {
  beforeAll(() => {
    yargsMock.argv.config = path.resolve(__dirname, '__mocks__/just-task.js');
    jest.spyOn(logger, 'info').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    undertaker.registry(new JustTaskRegistry());
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
      let result = testFunction();
      return Promise.resolve(result);
    });

    parallel('test')(function() {
      expect(testFunction).toBeCalledTimes(1);
      done();
    });
  });

  it('allows tasks to be injected before another one after definition', done => {
    const callOrder: number[] = [];

    const test1Function = jest.fn(() => {
      callOrder.push(1);
    });
    const test2Function = jest.fn(() => {
      callOrder.push(2);
    });

    task('test1', test1Function);
    task('test2', test2Function);
    task('test2')!.runBefore('test1');

    parallel('test1')(() => {
      expect(test2Function).toBeCalledTimes(1);
      expect(test1Function).toBeCalledTimes(1);
      expect(callOrder).toEqual([2, 1]);
      done();
    });
  });

  it('allows tasks to be injected after another one', done => {
    const callOrder: number[] = [];

    const test1Function = jest.fn(() => {
      callOrder.push(1);
    });
    const test2Function = jest.fn(() => {
      callOrder.push(2);
    });

    task('test1', test1Function);
    task('test2', test2Function);
    task('test2')!.runAfter('test1');

    parallel('test1')(() => {
      expect(test2Function).toBeCalledTimes(1);
      expect(test1Function).toBeCalledTimes(1);
      expect(callOrder).toEqual([1, 2]);
      done();
    });
  });
});
