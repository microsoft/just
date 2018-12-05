import { task, series, parallel, logger } from 'just-task';
import path from 'path';
import resolve from 'resolve';
import webpack from 'webpack';

task('webpack', function(done) {
  const webpackConfig = require('../config/webpack.dll.config.js');

  if (!webpackConfig.entry) {
    webpackConfig.entry = ['./lib/index.js'];
  }

  webpack(webpackConfig, (err, stats) => {
    if (err) {
      this.logger.error(err.message);
      return done(err);
    }

    this.logger.info(stats.toString());
    done();
  });
});
