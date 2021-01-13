const { task, series, parallel, condition, option, logger, argv } = require('../lib/index');
const cp = require('child_process');

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
    return function () {
      return new Promise((resolve, reject) => {
        cp.exec('node ./longprocess.js', (error, stdout, stderr) => (error ? reject(stderr) : resolve(stdout)));
      });
    };
  });

  task('webpack:promise', () => {
    const someVar = Math.random();

    return function () {
      return new Promise((resolve, reject) => {
        logger.info('Webpack bundling files', someVar);
        setTimeout(() => {
          reject('adsfadsf');
        }, 500);
      });
    };
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
