import { globSync } from 'glob';
import path from 'path';
import fs from 'fs';
import type { TaskFunction } from 'just-task';
import { resolveCwd, logger } from 'just-task';
import { tryRequire } from '../tryRequire';
import parallelLimit from 'run-parallel-limit';

export interface SassTaskOptions {
  createSourceModule: (fileName: string, css: string) => string;
  // Because we do not statically import postcssPlugin package, we cannot enforce type of postcssPlugins
  postcssPlugins?: unknown[];
}

type SassModule = {
  render: (
    options: { file: string; importer: typeof patchSassUrl; includePaths: string[] },
    cb: (err: Error, result: { css: Buffer }) => void,
  ) => void;
};

export function sassTask(options: SassTaskOptions): TaskFunction {
  const { createSourceModule, postcssPlugins = [] } = options;

  return function sass(done) {
    const sassModule = tryRequire<SassModule>('sass') || tryRequire<SassModule>('node-sass');
    const postcss =
      tryRequire<
        (plugins: unknown[]) => { process: (css: string, options: { from: string }) => Promise<{ css: string }> }
      >('postcss');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const autoprefixer = tryRequire<(options: unknown) => Function>('autoprefixer');
    const postcssRtl = tryRequire<(options: unknown) => unknown>('postcss-rtl');
    const clean = tryRequire<() => unknown>('postcss-clean');

    if (!sassModule || !postcss || !autoprefixer) {
      logger.warn(
        'One or more dependencies (sass or node-sass, postcss, autoprefixer) is not installed, so this task has no effect',
      );
      done();
      return;
    }

    const autoprefixerFn = autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'ie >= 11'] });
    const files = globSync('src/**/*.scss', { absolute: true });

    if (!files.length) {
      done();
      return;
    }

    const tasks: parallelLimit.Task<void>[] = files.map(fileName => cb => {
      fileName = path.resolve(fileName);
      sassModule.render(
        {
          file: fileName,
          importer: patchSassUrl,
          includePaths: [path.resolve(process.cwd(), 'node_modules')],
        },
        (err, result) => {
          if (err) {
            cb(new Error(`${path.relative(process.cwd(), fileName)}: ${err}`));
            return;
          }

          const css = result.css.toString();

          const plugins = [autoprefixerFn, ...postcssPlugins];

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
            .then(res => {
              fs.writeFileSync(fileName + '.ts', createSourceModule(fileName, res.css));
              cb(null);
            })
            .catch(e => cb(e as Error));
        },
      );
    });

    parallelLimit(tasks, 5, done);
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
