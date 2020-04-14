// This doesn't have types for some reason
const { DefaultReporter } = require('@jest/reporters');

/**
 * The purpose of this custom reporter is to prevent Jest from logging to stderr
 * when there are no errors.
 */
class JestReporter extends DefaultReporter {
  private _isLoggingError = false;

  public log(message: string) {
    if (this._isLoggingError) {
      process.stderr.write(message + '\n');
    } else {
      process.stdout.write(message + '\n');
    }
  }

  public printTestFileFailureMessage(...args: any[]) {
    this._isLoggingError = true;
    super.printTestFileFailureMessage(...args);
    this._isLoggingError = false;
  }
}

// jest needs this format
module.exports = JestReporter;
