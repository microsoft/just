import { task, series, parallel, condition, option, logger, argv } from '../../index';

// Currently export = is required by the usage in cli.spec.ts
export = () => {
  option('name');
  option('production');

  task('clean', 'this is cleaning', function () {
    logger.info('fake cleaning up the build and lib and dist folders');
  });

  task('ts', function () {
    logger.info('fake building with typescript');
  });

  task('eslint', function () {
    logger.info('fake linting with eslint');
  });

  task('webpack', () => {
    const someVar = Math.random();

    return function (done) {
      logger.info('fake webpack bundling files', someVar);
      setTimeout(() => {
        done();
      }, 25);
    };
  });

  let var1 = 0;
  task('webpack:promise', () => {
    var1++;

    return new Promise(resolve => {
      logger.info('fake webpack bundling files', var1);
      setTimeout(() => {
        resolve(undefined);
      }, 25);
    });
  });

  let var2 = 0;
  task('webpack:promise:fail', () => {
    var2++;

    return function () {
      return new Promise((_resolve, reject) => {
        logger.info('fake webpack bundling files', var2);
        setTimeout(() => {
          reject(new Error('adsfadsf'));
        }, 25);
      });
    };
  });

  task('build', parallel('eslint', series('clean', 'ts', 'webpack')));

  task(
    'cond',
    parallel(
      'eslint',
      series(
        'clean',
        condition('ts', () => !!argv().production),
        parallel('webpack', 'webpack:promise'),
      ),
    ),
  );

  task('default', parallel('cond'));
};
