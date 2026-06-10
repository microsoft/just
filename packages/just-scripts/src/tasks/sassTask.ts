import fs from 'fs';
import { globSync } from 'glob';
import { logger, resolveCwd, type TaskFunction } from 'just-task';
import path from 'path';
import type { AcceptedPlugin } from 'postcss';
import parallelLimit from 'run-parallel-limit';
import { pathToFileURL } from 'url';
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
 *
 * Uses the modern `compile()` API when available (provided by `sass`), and falls back to the
 * legacy `render()` API otherwise (e.g. when only `node-sass` is installed).
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
        !postcss && 'postcss',
        !autoprefixer && 'autoprefixer',
        !sassModule && 'one of sass or node-sass',
      ]
        .filter(Boolean)
        .join(', ');
      logger.warn(`Required dependencies not found (${missing}), so this task has no effect.`);
      done();
      return;
    }

    const autoprefixerFn = autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'ie >= 11'] });
    const files = globSync('src/**/*.scss', { absolute: true, cwd: process.cwd() });

    const tasks: parallelLimit.Task<void>[] = files.map(fileName => cb => {
      fileName = path.resolve(fileName);

      // The modern `compile()` API is available in `sass` but not in `node-sass`
      if (typeof sassModule.compile === 'function') {
        try {
          const { css } = sassModule.compile(fileName, {
            importers: [{ findFileUrl: patchSassFileUrl }],
            loadPaths: [path.resolve(process.cwd(), 'node_modules')],
          });
          processCss(css);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          cb(new Error(`${path.relative(process.cwd(), fileName)}: ${message}`));
        }
      } else {
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

            processCss(result.css.toString());
          },
        );
      }

      function processCss(css: string) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- always defined per above
        postcss!([
          autoprefixerFn,
          ...(postcssRtl ? [postcssRtl({})] : []),
          ...postcssPlugins,
          ...(clean ? [clean()] : []),
        ])
          .process(css, { from: fileName })
          .then(res => {
            fs.writeFileSync(fileName + '.ts', createSourceModule(fileName, res.css));
            cb(null);
          })
          .catch(e => cb(e instanceof Error ? e : new Error(String(e))));
      }
    });

    parallelLimit(tasks, 5, done);
  };
}

function requireResolvePackageUrl(packageUrl: string) {
  const fullName = packageUrl + (packageUrl.endsWith('.scss') ? '' : '.scss');
  return resolveCwd(fullName) || resolveCwd(path.join(path.dirname(fullName), `_${path.basename(fullName)}`));
}

/** Legacy `render()` importer: resolves `~package` URLs to a file path. */
function patchSassUrl(url: string) {
  let newUrl: string = url;

  if (url[0] === '~') {
    newUrl = requireResolvePackageUrl(url.slice(1)) || '';
  } else if (url === 'stdin') {
    newUrl = '';
  }

  return { file: newUrl };
}

/** Modern `compile()` importer: resolves `~package` URLs to a `file:` URL. */
function patchSassFileUrl(url: string): URL | null {
  if (url[0] === '~') {
    const resolved = requireResolvePackageUrl(url.slice(1));
    return resolved ? pathToFileURL(resolved) : null;
  }

  return null;
}
