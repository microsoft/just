const { task, series, parallel } = require('../lib/index');

task('clean', function() {
  this.logger.info('Cleaning up the build and lib and dist folders');
});

task('ts', function() {
  this.logger.info('Here we can run build steps like Babel or Typescript');
});

task('warn', function() {
  this.logger.warn('This is what a warning looks like');
});

task('fail', function() {
  throw new Error('this is an intentional error');
});

task('tslint', function() {
  this.logger.info('Linting with tslint');
});

task('webpack', function() {
  this.logger.info('Webpack bundling files');
});

task('build', parallel('tslint', series('clean', 'ts', 'webpack', 'warn', 'fail')));

task('default', parallel('build'));
