import fs from 'fs';
import { globSync } from 'glob';
import { logger, resolveCwd, type TaskFunction } from 'just-task';
import path from 'path';
import type { AcceptedPlugin } from 'postcss';
import parallelLimit from 'run-parallel-limit';
import { tryRequire } from '../tryRequire';

export interface SassTaskOptions {
  createSourceModule: (fileName: string, css: string) => string;
  postcssPlugins?: AcceptedPlugin[];
}

/**
 * Create a task to run sass.
 *
 * Logs a warning if any required dependencies are not found.
 * - Required: `sass` or `node-sass`; `postcss`; `autoprefixer`.
 * - Optional: `postcss-rtl`, `postcss-clean`, and any postcss plugins passed in through `options`.
 */
export function sassTask(options: SassTaskOptions): TaskFunction {
  const { createSourceModule, postcssPlugins = [] } = options;

  return function sass(done) {
    const sassModule = tryRequire<typeof import('sass')>('sass') || tryRequire<typeof import('sass')>('node-sass');
    const postcss = tryRequire<typeof import('postcss')>('postcss');
    const autoprefixer = tryRequire<typeof import('autoprefixer')>('autoprefixer');
    // these don't have types
    const postcssRtl = tryRequire<(options: unknown) => AcceptedPlugin>('postcss-rtl');
    const clean = tryRequire<() => AcceptedPlugin>('postcss-clean');

    if (!sassModule || !postcss || !autoprefixer) {
      const missing = [
        !sassModule && 'one of sass or node-sass',
        !postcss && 'postcss',
        !autoprefixer && 'autoprefixer',
      ]
        .filter(Boolean)
        .join(', ');
      logger.warn(`Required dependencies not found (${missing}), so this task has no effect.`);
      done();
      return;
    }

    const autoprefixerFn = autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'ie >= 11'] });
    const files = globSync('src/**/*.scss', { absolute: true });

    const tasks: parallelLimit.Task<void>[] = files.map(fileName => cb => {
      fileName = path.resolve(fileName);
      sassModule.render(
        {
          file: fileName,
          importer: patchSassUrl,
          includePaths: [path.resolve(process.cwd(), 'node_modules')],
        },
        (err, result) => {
          if (err || !result) {
            cb(new Error(`${path.relative(process.cwd(), fileName)}: ${err || 'no result returned'}`));
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
