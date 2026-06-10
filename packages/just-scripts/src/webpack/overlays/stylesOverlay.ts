// WARNING: Careful about adding more imports - only import types from externals
import type { Configuration, RuleSetRule } from 'webpack';
import { resolveWrapper, tryRequire } from '../../tryRequire';

const cssTest = /\.css$/;
const cssModuleTest = /\.module\.css$/;
const sassTest = /\.(scss|sass)$/;
const sassModuleTest = /\.module\.(scss|sass)$/;
const defaultIdentName = '[name]_[local]_[hash:base64:5]';

export interface CssLoaderOptions {
  modules?: boolean;
  localIdentName?: string;
}

function createStyleLoaderRule(
  options: CssLoaderOptions & {
    cssLoaderPath: string;
    styleLoaderPath: string;
    postcssLoaderPath: string | null;
    autoprefixer: unknown;
    sassLoaderPath?: string;
  },
): RuleSetRule['use'] {
  const { modules, localIdentName, sassLoaderPath, cssLoaderPath, postcssLoaderPath, autoprefixer, styleLoaderPath } =
    options;

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
        modules: localIdentName ? { mode: 'local', localIdentName } : modules,
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

  return {
    module: {
      rules: [
        {
          test: cssTest,
          exclude: [/node_modules/, cssModuleTest],
          use: createStyleLoaderRule({
            ...loaderArgs,
            modules: false,
            localIdentName,
          }),
          sideEffects: true,
        },
        {
          test: cssModuleTest,
          exclude: [/node_modules/],
          use: createStyleLoaderRule({
            ...loaderArgs,
            modules: true,
            localIdentName,
          }),
        },
        ...(sassLoaderPath
          ? [
              {
                test: sassTest,
                exclude: [/node_modules/, sassModuleTest],
                use: createStyleLoaderRule({
                  ...loaderArgs,
                  sassLoaderPath,
                  modules: false,
                  localIdentName,
                }),
                sideEffects: true,
              },
              {
                test: sassModuleTest,
                exclude: [/node_modules/],
                use: createStyleLoaderRule({
                  ...loaderArgs,
                  sassLoaderPath,
                  modules: true,
                  localIdentName,
                }),
              },
            ]
          : []),
      ],
    },
  };
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
