import { task } from '../task';
import { chain } from '../chain';
import { parallel } from '../undertaker';

describe('chain', () => {
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
    chain('test2').before('test1');

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

    chain('test2').after('test1');

    parallel('test1')(() => {
      expect(test2Function).toBeCalledTimes(1);
      expect(test1Function).toBeCalledTimes(1);
      expect(callOrder).toEqual([1, 2]);
      done();
    });
  });
});
