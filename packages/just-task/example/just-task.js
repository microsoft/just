const { task, series, parallel, condition, option, logger, argv } = require('../lib/index');

option('name').option('production');

task('clean', 'this is cleaning', function() {
  logger.info('Cleaning up the build and lib and dist folders');
});

task('ts', function() {
  logger.info('Here we can run build steps like Babel or Typescript');
});

task('tslint', function() {
  logger.info('Linting with tslint');
});

task('webpack', function() {
  logger.info('Webpack bundling files');
});

task('build', parallel('tslint', series('clean', 'ts', 'webpack')));

task(
  'cond',
  parallel(
    'tslint',
    series(
      'clean',
      condition('ts', () => {
        return argv().production;
      }),
      'webpack'
    )
  )
);

task('default', parallel('build'));
