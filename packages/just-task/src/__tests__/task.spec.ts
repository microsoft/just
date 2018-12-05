import { task } from '../task';
import { parallel, undertaker } from '../undertaker';
import { JustTaskRegistry } from '../JustTaskRegistry';
import yargs from 'yargs';
import path from 'path';

describe('task', () => {
  beforeEach(() => {
    const yargsBuilder = yargs;
    yargsBuilder.option('config', { default: path.resolve(__dirname, 'mock/rig.js') });
    undertaker.registry(new JustTaskRegistry(yargsBuilder));
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

  it('exposes logger in the context', done => {
    task('test', function() {
      expect(this.logger).not.toBeNull();
    });

    parallel('test')(function() {
      done();
    });
  });

  it('exposes argv in the context', done => {
    task('test', function() {
      expect(this.argv).not.toBeNull();
    });

    parallel('test')(function() {
      done();
    });
  });

  it('can take in yargs argv', done => {
    task('test', { builder: yargs => yargs.option('name', { default: 'hello' }) }, function() {
      expect(this.argv).not.toBeNull();
      expect(this.argv.name).not.toBe('hello');
    });

    parallel('test')(function() {
      done();
    });
  });
});
