import glob from 'glob';
import path from 'path';
import fs from 'fs';
import { resolveCwd, TaskFunction } from 'just-task';
import parallelLimit from 'run-parallel-limit';

import * as nodeSass from 'node-sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

/**
 * Generate a task function which converts SASS files to TypeScript modules.
 * The `nodeSassModule`, `postcssModule`, and `autoprefixerModule` params are needed because
 * just-scripts does not take a (non-dev) dependency on or bundle these modules.
 *
 * @param nodeSassModule node-sass module (`import nodeSass from 'node-sass'`)
 * @param postcssModule postcss module (`import postcss from 'postcss'`)
 * @param autoprefixerModule autoprefixer module (`import autoprefixer from 'autoprefixer'`)
 * @param transformToTS Function for transforming styles from a SASS file into a
 * TypeScript module which loads the styles
 * @param postcssPlugins Plugins passed to postcss (type is `postcss.AcceptedPlugin[]`)
 */
export function sassTask(
  nodeSassModule: any,
  postcssModule: any,
  autoprefixerModule: any,
  transformToTS: (fileName: string, css: string) => string,
  postcssPlugins: any[] = []
): TaskFunction {
  return function sass(done: (err?: Error) => void) {
    const files = glob.sync(path.resolve(process.cwd(), 'src/**/*.scss'));

    if (!files.length) {
      done();
      return;
    }

    const tasks = files.map(
      fileName =>
        function(cb: (err?: any) => void) {
          fileName = path.resolve(fileName);
          const ns: typeof nodeSass = nodeSassModule;
          ns.render(
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
                const ap: typeof autoprefixer = autoprefixerModule;
                const pc: typeof postcss = postcssModule;
                const plugins: postcss.AcceptedPlugin[] = postcssPlugins;

                const autoprefixerFn = ap({ browsers: ['> 1%', 'last 2 versions', 'ie >= 11'] });
                const css = result.css.toString();

                pc([autoprefixerFn!, ...plugins])
                  .process(css, { from: fileName })
                  .then((result: { css: string }) => {
                    fs.writeFileSync(fileName + '.ts', transformToTS(fileName, result.css));
                    cb();
                  });
              }
            }
          );
        }
    );

    parallelLimit(tasks, 5, done);
  };
}

function requireResolvePackageUrl(packageUrl: string) {
  const fullName = packageUrl + (packageUrl.endsWith('.scss') ? '' : '.scss');
  return (
    resolveCwd(fullName) ||
    resolveCwd(path.join(path.dirname(fullName), `_${path.basename(fullName)}`))
  );
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
