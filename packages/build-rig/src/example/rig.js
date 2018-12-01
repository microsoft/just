const { task, series, parallel } = require('../index');

task('done', function(done) {
  this.logger.info('arsg_done: ', this.argv);
  setTimeout(done, 500);
});

task('ctxonly', function() {
  this.logger.info('ctxonly');
});

task('async', async function() {
  this.logger.info(await Promise.resolve('async'));
});

task('default', parallel('done', 'ctxonly', 'async'));
task('yes', series('default'));
