import { logger } from '../logger';
import chalk from 'chalk';

describe('logger', () => {
  const fakeTime = new Date().toLocaleTimeString();
  const timeStr = `[${fakeTime}]`;
  const emptySquare = '\u25a1';
  const square = '\u25a0';
  const triangle = '\u25b2';
  const consoleInfo = jest.fn();
  const consoleWarn = jest.fn();
  const consoleError = jest.fn();

  beforeAll(() => {
    // Log entries include time, so use a constant value for testing
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue(fakeTime);
    // Override console methods
    jest.spyOn(console, 'info').mockImplementation(consoleInfo);
    jest.spyOn(console, 'warn').mockImplementation(consoleWarn);
    jest.spyOn(console, 'error').mockImplementation(consoleError);
    // Disable chalk colors so it's easier to compare results
    chalk.enabled = false;
  });

  beforeEach(() => {
    jest.clearAllMocks(); // reset call counts
  });

  afterAll(() => {
    jest.restoreAllMocks();
    chalk.enabled = true;
    logger.enableVerbose = false;
  });

  // All logger methods use the same helper internally, so we use logger.info for most tests.

  it('handles logging with varying arg counts', () => {
    logger.info();
    expect(consoleInfo).toHaveBeenCalledTimes(1);
    expect(consoleInfo).toHaveBeenCalledWith(timeStr, square);

    logger.info('hello');
    expect(consoleInfo).toHaveBeenCalledTimes(2);
    expect(consoleInfo).toHaveBeenCalledWith(timeStr, square, 'hello');

    logger.info('hello', 'world');
    expect(consoleInfo).toHaveBeenCalledTimes(3);
    expect(consoleInfo).toHaveBeenCalledWith(timeStr, square, 'hello', 'world');
  });

  it('handles logging non-strings', () => {
    const obj = {};
    logger.info(obj, 3, null, undefined);
    expect(consoleInfo).toHaveBeenCalledTimes(1);
    expect(consoleInfo).toHaveBeenCalledWith(timeStr, square, obj, 3, null, undefined);
  });

  it('handles verbose logging', () => {
    logger.enableVerbose = false;
    logger.verbose('hi');
    expect(consoleInfo).toHaveBeenCalledTimes(0);

    logger.enableVerbose = true;
    logger.verbose('hi');
    expect(consoleInfo).toHaveBeenCalledTimes(1);
    expect(consoleInfo).toHaveBeenCalledWith(timeStr, emptySquare, 'hi');
  });

  it('handles warn logging', () => {
    logger.warn('warning');
    expect(consoleWarn).toHaveBeenCalledTimes(1);
    expect(consoleWarn).toHaveBeenCalledWith(timeStr, triangle, 'warning');
  });

  it('handles error logging', () => {
    logger.error('oh no!');
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(timeStr, 'x', 'oh no!');
  });
});
