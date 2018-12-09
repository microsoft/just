import { logger } from 'just-task';

export function webpackTask() {
  return function webpack() {
    logger.info(`Running Webpack`);
    const webpackConfigPath = path.join(process.cwd(), 'webpack.config.js');

    return new Promise((resolve, reject) => {
      fs.exists(webpackConfigPath, isFileExists => {
        if (!isFileExists) {
          return Promise.resolve();
        }

        const configLoader = require(webpackConfigPath);
        let config;

        // If the loaded webpack config is a function
        // call it with the original process.argv arguments from build.js.
        if (typeof configLoader == 'function') {
          config = configLoader(options.argv);
        } else {
          config = configLoader;
        }
        config = flatten(config);

        webpack(config, (err, stats) => {
          if (err || stats.hasErrors()) {
            let errorStats = stats.toJson('errors-only');
            errorStats.errors.forEach(error => {
              console.log(chalk.red(error));
            });
            reject(`Webpack failed with ${errorStats.errors.length} error(s).`);
          } else {
            _printStats(stats);
            resolve();
          }
        });
      });
    });
  };
}
