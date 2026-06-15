// WARNING: Careful about adding more imports - only import types from externals
import type { Configuration, RuleSetRule } from 'webpack';
import { resolveWrapper, tryRequire } from '../../tryRequire';

const cssTest = /\.css$/;
const cssModuleTest = /\.module\.css$/;
const sassTest = /\.(scss|sass)$/;
const sassModuleTest = /\.module\.(scss|sass)$/;
const defaultIdentName = '[name]_[local]_[hash:base64:5]';

export interface CssLoaderOptions {
  /**
   * If true, force enabling CSS modules (with `localIdentName` or the default) for all files.
   * If false, force disabling CSS modules for all files.
   * If undefined, enable only for `*.module.[s]css`.
   */
  modules?: boolean;
  /** Class name format override. Ignored if `modules: false`. */
  localIdentName?: string;
}

function createStyleLoaderRule(
  options: Pick<CssLoaderOptions, 'localIdentName'> & {
    cssLoaderPath: string;
    styleLoaderPath: string;
    postcssLoaderPath: string | null;
    autoprefixer: unknown;
    sassLoaderPath?: string;
  },
): RuleSetRule['use'] {
  const { localIdentName, sassLoaderPath, cssLoaderPath, postcssLoaderPath, autoprefixer, styleLoaderPath } = options;

  const preloaders: RuleSetRule['use'] = [];
  postcssLoaderPath &&
    preloaders.push({
      loader: postcssLoaderPath,
      options: {
        // valid options: https://www.npmjs.com/package/postcss-loader
        postcssOptions: autoprefixer ? { plugins: () => [autoprefixer] } : {},
      },
    });
  sassLoaderPath && preloaders.push({ loader: sassLoaderPath });

  return [
    {
      // creates style nodes from JS strings
      loader: styleLoaderPath,
    },
    {
      // translates CSS into CommonJS
      loader: cssLoaderPath,
      options: {
        modules: localIdentName ? { mode: 'local', localIdentName } : false,
        importLoaders: preloaders.length,
      },
    },
    ...preloaders,
  ];
}

/**
 * Create a style module rules config overlay with custom options.
 * Returns an empty config if `css-loader` is not found.
 *
 * Required dependencies: `css-loader`, one of `style-loader` or `@microsoft/loader-load-themed-styles`
 * (throws if no style loader is found).
 *
 * Optional dependencies: `postcss-loader`, `postcss`, `autoprefixer`, `sass-loader`, one of `sass` or `node-sass`.
 */
export function createStylesOverlay(options: CssLoaderOptions = {}): Configuration {
  const localIdentName = options.localIdentName || defaultIdentName;
  const moduleOption = options.modules;

  const cssLoaderPath = resolveWrapper('css-loader');
  if (!cssLoaderPath) {
    return {};
  }

  const styleLoaderPath = resolveWrapper('@microsoft/loader-load-themed-styles') || resolveWrapper('style-loader');
  if (!styleLoaderPath) {
    throw new Error(
      'Could not find "@microsoft/loader-load-themed-styles" or "style-loader". Please install one of these packages.',
    );
  }

  const loaderArgs = {
    cssLoaderPath,
    styleLoaderPath,
    postcssLoaderPath: resolveWrapper('postcss-loader'),
    autoprefixer: tryRequire<unknown>('autoprefixer'),
  };
  const sassLoaderPath =
    resolveWrapper('sass') || resolveWrapper('node-sass') ? resolveWrapper('sass-loader') : undefined;

  const rules: RuleSetRule[] = [];

  if (moduleOption !== true) {
    rules.push({
      test: cssTest,
      exclude: [/node_modules/, ...(moduleOption === false ? [] : [cssModuleTest])],
      use: createStyleLoaderRule({ ...loaderArgs }),
      sideEffects: true,
    });
  }
  if (moduleOption !== false) {
    rules.push({
      test: moduleOption ? cssTest : cssModuleTest,
      exclude: [/node_modules/],
      use: createStyleLoaderRule({ ...loaderArgs, localIdentName }),
    });
  }

  if (sassLoaderPath) {
    // these should exactly mirror the above but add sassLoaderPath
    if (moduleOption !== true) {
      rules.push({
        test: sassTest,
        exclude: [/node_modules/, ...(moduleOption === false ? [] : [sassModuleTest])],
        use: createStyleLoaderRule({ ...loaderArgs, sassLoaderPath }),
        sideEffects: true,
      });
    }
    if (moduleOption !== false) {
      rules.push({
        test: moduleOption ? sassTest : sassModuleTest,
        exclude: [/node_modules/],
        use: createStyleLoaderRule({ ...loaderArgs, sassLoaderPath, localIdentName }),
      });
    }
  }

  return { module: { rules } };
}

/**
 * Create a style module rules config overlay with default options.
 * Returns an empty config if `css-loader` is not found.
 *
 * Required dependencies: `css-loader`, one of `style-loader` or `@microsoft/loader-load-themed-styles`
 * (throws if no style loader is found).
 *
 * Optional dependencies: `postcss-loader`, `postcss`, `autoprefixer`, `sass-loader`, one of `sass` or `node-sass`.
 */
export function stylesOverlay(): Configuration {
  return createStylesOverlay({
    localIdentName: defaultIdentName,
  });
}
