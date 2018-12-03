const { task, series, parallel } = require('../lib/index');

task('clean', function() {
  this.logger.info('Cleaning up the build and lib and dist folders');
});

task('ts', function() {
  this.logger.info('Here we can run build steps like Babel or Typescript');
});

task('tslint', function() {
  this.logger.info('Linting with tslint');
});

task('webpack', function() {
  this.logger.info('Webpack bundling files');
});

task('build', parallel('tslint', series('clean', 'ts', 'webpack')));

task('default', parallel('build'));
