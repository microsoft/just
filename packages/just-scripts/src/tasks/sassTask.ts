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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sassModule = tryRequire('sass') || tryRequire('node-sass');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const postcss = tryRequire('postcss');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const autoprefixer = tryRequire('autoprefixer');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const postcssRtl = tryRequire('postcss-rtl');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const clean = tryRequire('postcss-clean');

    if (!sassModule || !postcss || !autoprefixer) {
      logger.warn(
        'One or more dependencies (sass or node-sass, postcss, autoprefixer) is not installed, so this task has no effect',
      );
      done();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const autoprefixerFn = autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'ie >= 11'] });
    const files = glob.sync(path.resolve(process.cwd(), 'src/**/*.scss'));

    if (files.length) {
      const tasks = files.map(
        (fileName: string) =>
          function (cb: any) {
            fileName = path.resolve(fileName);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            sassModule.render(
              {
                file: fileName,
                importer: patchSassUrl,
                includePaths: [path.resolve(process.cwd(), 'node_modules')],
              },
              (err: Error, result: { css: Buffer }) => {
                if (err) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  cb(`${path.relative(process.cwd(), fileName)}: ${err}`);
                } else {
                  const css = result.css.toString();

                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const plugins = [autoprefixerFn, ...postcssPlugins];

                  // If the rtl plugin exists, insert it after autoprefix.
                  if (postcssRtl) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    plugins.splice(plugins.indexOf(autoprefixerFn) + 1, 0, postcssRtl({}));
                  }

                  // If postcss-clean exists, add it to the end of the chain.
                  if (clean) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    plugins.push(clean());
                  }

                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  postcss(plugins)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    .process(css, { from: fileName })
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    .then((res: { css: string }) => {
                      fs.writeFileSync(fileName + '.ts', createSourceModule(fileName, res.css));
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
