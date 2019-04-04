// This doesn't have types for some reason
const DefaultReporter = require('jest-cli/build/reporters/default_reporter').default;

/**
 * The purpose of this custom reporter is to prevent Jest from logging to stderr
 * when there are no errors.
 */
class JestReporter extends DefaultReporter {
  private _isLoggingError: boolean;

  constructor(...args: any[]) {
    super(...args);

    this._isLoggingError = false;
  }

  public log = (message: string) => {
    if (this._isLoggingError) {
      process.stderr.write(message + '\n');
    } else {
      process.stdout.write(message + '\n');
    }
  };

  public printTestFileFailureMessage(...args: any[]) {
    this._isLoggingError = true;
    super.printTestFileFailureMessage(...args);
    this._isLoggingError = false;
  }
}

module.exports = JestReporter;
