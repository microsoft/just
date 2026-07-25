import fs from 'fs';
import { globSync } from 'glob';
import { logger, resolveCwd, type TaskFunction } from 'just-task';
import path from 'path';
import type { AcceptedPlugin } from 'postcss';
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

  return async function sass() {
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
      return;
    }

    const autoprefixerFn = autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'ie >= 11'] });
    const files = globSync('src/**/*.scss', { absolute: true, cwd: process.cwd() });

    // p-limit is ESM and must be async imported from CJS
    const pLimit = (await import('p-limit')).default;
    const limiter = pLimit(5);

    await Promise.all(
      files.map(file =>
        limiter(async () => {
          const fileName = path.resolve(file);

          let css: string;
          // The modern `compile()` API is available in `sass` but not in `node-sass`
          if (typeof sassModule.compile === 'function') {
            try {
              css = sassModule.compile(fileName, {
                importers: [{ findFileUrl: patchSassFileUrl }],
                loadPaths: [path.resolve(process.cwd(), 'node_modules')],
              }).css;
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              throw new Error(`${path.relative(process.cwd(), fileName)}: ${message}`, { cause: err });
            }
          } else {
            // The legacy `render()` API is callback-based, so it must be promisified
            css = await new Promise<string>((resolve, reject) => {
              sassModule.render(
                {
                  file: fileName,
                  importer: patchSassUrl,
                  includePaths: [path.resolve(process.cwd(), 'node_modules')],
                },
                (err, result) => {
                  if (err || !result) {
                    reject(new Error(`${path.relative(process.cwd(), fileName)}: ${err || 'no result returned'}`));
                  } else {
                    resolve(result.css.toString());
                  }
                },
              );
            });
          }

          const res = await postcss([
            autoprefixerFn,
            ...(postcssRtl ? [postcssRtl({})] : []),
            ...postcssPlugins,
            ...(clean ? [clean()] : []),
          ]).process(css, { from: fileName });

          fs.writeFileSync(fileName + '.ts', createSourceModule(fileName, res.css));
        }),
      ),
    );
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
