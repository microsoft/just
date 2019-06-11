const DefaultReporter = require('@jest/reporters').DefaultReporter;

/**
 * The purpose of this custom reporter is to prevent Jest from logging to stderr
 * when there are no errors.
 */
class JestReporter extends DefaultReporter {
  log(message) {
    process.stdout.write(message + '\n');
  }
}

module.exports = JestReporter;
