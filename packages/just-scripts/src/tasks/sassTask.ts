import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import { resolveCwd, TaskFunction, logger } from 'just-task';
import { tryRequire } from '../tryRequire';
import parallelLimit = require('run-parallel-limit');

export interface SassTaskOptions {
  createSourceModule: (fileName: string, css: string) => string;
  // Because we do not statically import postcssPlugin package, we cannot enforce type of postcssPlugins
  postcssPlugins?: any[];
}

export function sassTask(options: SassTaskOptions): TaskFunction;
/** @deprecated Use object param version */
export function sassTask(
  createSourceModule: (fileName: string, css: string) => string,
  postcssPlugins?: any[],
): TaskFunction;
export function sassTask(
  optionsOrCreateSourceModule: SassTaskOptions | ((fileName: string, css: string) => string),
  postcssPlugins?: any[],
): TaskFunction {
  let createSourceModule: (fileName: string, css: string) => string;
  if (typeof optionsOrCreateSourceModule === 'function') {
    createSourceModule = optionsOrCreateSourceModule;
  } else {
    createSourceModule = optionsOrCreateSourceModule.createSourceModule;
    postcssPlugins = optionsOrCreateSourceModule.postcssPlugins;
  }
  postcssPlugins = postcssPlugins || [];

  return function sass(done: (err?: Error) => void) {
    const sass = tryRequire('sass') || tryRequire('node-sass');
    const postcss = tryRequire('postcss');
    const autoprefixer = tryRequire('autoprefixer');
    const postcssRtl = tryRequire('postcss-rtl');
    const clean = tryRequire('postcss-clean');

    if (!sass || !postcss || !autoprefixer) {
      logger.warn(
        'One or more dependencies (sass or node-sass, postcss, autoprefixer) is not installed, so this task has no effect',
      );
      done();
      return;
    }

    const autoprefixerFn = autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'ie >= 11'] });
    const files = glob.sync(path.resolve(process.cwd(), 'src/**/*.scss'));

    if (files.length) {
      const tasks = files.map(
        (fileName: string) =>
          function (cb: any) {
            fileName = path.resolve(fileName);
            sass.render(
              {
                file: fileName,
                importer: patchSassUrl,
                includePaths: [path.resolve(process.cwd(), 'node_modules')],
              },
              (err: Error, result: { css: Buffer }) => {
                if (err) {
                  cb(path.relative(process.cwd(), fileName) + ': ' + err);
                } else {
                  const css = result.css.toString();

                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  const plugins = [autoprefixerFn, ...postcssPlugins!];

                  // If the rtl plugin exists, insert it after autoprefix.
                  if (postcssRtl) {
                    plugins.splice(plugins.indexOf(autoprefixerFn) + 1, 0, postcssRtl({}));
                  }

                  // If postcss-clean exists, add it to the end of the chain.
                  if (clean) {
                    plugins.push(clean());
                  }

                  postcss(plugins)
                    .process(css, { from: fileName })
                    .then((result: { css: string }) => {
                      fs.writeFileSync(fileName + '.ts', createSourceModule(fileName, result.css));
                      cb();
                    });
                }
              },
            );
          },
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

function patchSassUrl(url: string, _prev: string, _done: any) {
  let newUrl: string = url;

  if (url[0] === '~') {
    newUrl = requireResolvePackageUrl(url.substr(1)) || '';
  } else if (url === 'stdin') {
    newUrl = '';
  }

  return { file: newUrl };
}
