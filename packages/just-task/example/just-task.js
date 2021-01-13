const { task, series, parallel, condition, option, logger, argv } = require('../lib/index');

module.exports = () => {
  option('name').option('production');

  task('clean', 'this is cleaning', function () {
    logger.info('Cleaning up the build and lib and dist folders');
  });

  task('ts', function () {
    logger.info('Here we can run build steps like Babel or TypeScript');
  });

  task('tslint', function () {
    logger.info('Linting with tslint');
  });

  task('webpack', () => {
    const someVar = Math.random();

    return function (done) {
      logger.info('Webpack bundling files', someVar);
      setTimeout(() => {
        done();
      }, 500);
    };
  });

  task('webpack:promise', () => {
    const someVar = Math.random();

    return new Promise(resolve => {
      logger.info('Webpack bundling files', someVar);
      setTimeout(() => {
        resolve();
      }, 500);
    });
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
        parallel('webpack', 'webpack:promise'),
      ),
    ),
  );

  task('default', parallel('cond'));
};
