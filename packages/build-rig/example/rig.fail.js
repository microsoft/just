const { task, series, parallel } = require('../lib/index');

task('done', function(done) {
  this.logger.info('args_done: ', this.argv);
  setTimeout(done, 500);
});

task('ctxonly', { describe: 'ctx coolness', builder: yargs => yargs.option('name') }, function() {
  this.logger.info('ctxonly');
  this.logger.info(JSON.stringify(this.argv));
  this.logger.warn('This is what a warning looks like');
  throw new Error('intentionally fail');
});

task('async', async function() {
  this.logger.info(await Promise.resolve('async'));
});

task('default', parallel('done', 'ctxonly', series('async')));

task('yes', series('default'));
