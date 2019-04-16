import glob from 'glob';
import path from 'path';
import fs from 'fs';
import { resolveCwd, TaskFunction } from 'just-task';
import parallelLimit from 'run-parallel-limit';

// Because we do not statically import postcssPlugin package, we cannot enforce type of postcssPlugins
export function sassTask(createSourceModule: (fileName: string, css: string) => string, postcssPlugins: any[] = []) {
  const nodeSass = require('node-sass');
  const postcss = require('postcss');
  const autoprefixer = require('autoprefixer');
  const autoprefixerFn = autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'ie >= 11'] });

  return function sass(done: (err?: Error) => void) {
    const files = glob.sync(path.resolve(process.cwd(), 'src/**/*.scss'));

    if (files.length) {
      const tasks = files.map(
        fileName =>
          function(cb: any) {
            fileName = path.resolve(fileName);
            nodeSass.render(
              {
                file: fileName,
                outputStyle: 'compressed',
                importer: patchSassUrl,
                includePaths: [path.resolve(process.cwd(), 'node_modules')]
              },
              (err: Error, result: { css: Buffer }) => {
                if (err) {
                  cb(path.relative(process.cwd(), fileName) + ': ' + err);
                } else {
                  const css = result.css.toString();

                  postcss([autoprefixerFn!, ...postcssPlugins])
                    .process(css, { from: fileName })
                    .then((result: { css: string }) => {
                      fs.writeFileSync(fileName + '.ts', createSourceModule(fileName, result.css));
                      cb();
                    });
                }
              }
            );
          }
      );

      parallelLimit(tasks, 5, done);
    } else {
      done();
    }
  };
}

function requireResolvePackageUrl(packageUrl: string) {
  const fullName = packageUrl + (packageUrl.endsWith('.scss') ? '' : '.scss');
  return resolveCwd(fullName) || resolveCwd(path.join(path.dirname(fullName), `_${path.basename(fullName)}`));
}

function patchSassUrl(url: string, prev: string, done: any) {
  let newUrl: string = url;

  if (url[0] === '~') {
    newUrl = requireResolvePackageUrl(url.substr(1)) || '';
  } else if (url === 'stdin') {
    newUrl = '';
  }

  return { file: newUrl };
}
