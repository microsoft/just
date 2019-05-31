import { resolve } from 'just-task';
import { tryRequire } from '../../tryRequire';

const styleLoader = resolve('@microsoft/loader-load-themed-styles') || resolve('style-loader');
const sassLoader = resolve('node-sass') && resolve('sass-loader');
const cssLoader = resolve('css-loader');
const postCssLoader = resolve('postcss-loader');

const cssTest = /\.css$/;
const cssModuleTest = /\.module\.css$/;
const sassTest = /\.(scss|sass)$/;
const sassModuleTest = /\.module\.(scss|sass)$/;
const defaultIdentName = '[name]_[local]_[hash:base64:5]';

interface CssLoaderOptions {
  modules?: boolean;
  localIdentName?: string;
}

function createStyleLoaderRule(cssOptions: CssLoaderOptions, preprocessor: 'sass-loader' | null = null): any {
  const preloaders = [
    ...(postCssLoader
      ? [
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [tryRequire('autoprefixer')];
              }
            }
          }
        ]
      : []),
    ...(preprocessor ? [preprocessor] : [])
  ];

  return [
    {
      loader: styleLoader // creates style nodes from JS strings
    },
    {
      loader: 'css-loader', // translates CSS into CommonJS
      options: {
        ...cssOptions,
        importLoaders: preloaders.length
      }
    },
    ...preloaders
  ];
}

export const createStylesOverlay = function(options: CssLoaderOptions = {}) {
  return {
    module: {
      rules: [
        ...(cssLoader
          ? [
              {
                test: cssTest,
                exclude: [/node_modules/, cssModuleTest],
                use: createStyleLoaderRule({
                  modules: false,
                  localIdentName: options.localIdentName || defaultIdentName
                }),
                sideEffects: true
              },
              {
                test: cssModuleTest,
                exclude: [/node_modules/],
                use: createStyleLoaderRule({
                  modules: true,
                  localIdentName: options.localIdentName || defaultIdentName
                })
              }
            ]
          : []),
        ...(sassLoader && cssLoader
          ? [
              {
                test: sassTest,
                exclude: [/node_modules/, sassModuleTest],
                use: createStyleLoaderRule(
                  {
                    modules: false,
                    localIdentName: options.localIdentName || defaultIdentName
                  },
                  'sass-loader'
                ),
                sideEffects: true
              },
              {
                test: sassModuleTest,
                exclude: [/node_modules/],
                use: createStyleLoaderRule(
                  {
                    modules: true,
                    localIdentName: options.localIdentName || defaultIdentName
                  },
                  'sass-loader'
                )
              }
            ]
          : [])
      ]
    }
  };
};

export const stylesOverlay = createStylesOverlay({
  localIdentName: defaultIdentName
});
