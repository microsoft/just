// WARNING: Careful about adding more imports - only import types from externals
import type ForkTsCheckerWebpackPluginType from 'fork-ts-checker-webpack-plugin';
import type ts from 'typescript';
import type { Configuration } from 'webpack';
import { resolveWrapper, tryRequire } from '../../tryRequire';

export interface TsLoaderOptions {
  configFile?: string;
  transpileOnly?: boolean;
  onlyCompileBundledFiles?: boolean;
  colors?: boolean;
  compilerOptions?: ts.CompilerOptions;
  happyPackMode?: boolean;
  getCustomTransformers?: string | ((program: ts.Program) => ts.CustomTransformers | undefined);
  experimentalWatchApi?: boolean;
  allowTsInNodeModules?: boolean;
  experimentalFileCaching?: boolean;
  projectReferences?: boolean;
}

export type TsCheckerOptions = ConstructorParameters<typeof ForkTsCheckerWebpackPluginType>[0];

export interface TsOverlayOptions {
  loaderOptions?: TsLoaderOptions;
  /** Set to false to disable type checking */
  checkerOptions?: TsCheckerOptions | false;
}

/**
 * Create a typescript module rules config overlay.
 *
 * Required dependencies: `ts-loader` (throws if not found) and implicitly `typescript`.
 * Optional dependencies: `fork-ts-checker-webpack-plugin`.
 */
export function tsOverlay(overlayOptions?: TsOverlayOptions): Configuration {
  const ForkTsCheckerPlugin =
    overlayOptions?.checkerOptions !== false
      ? tryRequire<typeof import('fork-ts-checker-webpack-plugin')>('fork-ts-checker-webpack-plugin')
      : undefined;
  const tsLoaderPath = resolveWrapper('ts-loader');
  if (!tsLoaderPath) {
    throw new Error('Could not find "ts-loader". Please install this package.');
  }

  overlayOptions = overlayOptions || {};

  overlayOptions.loaderOptions = overlayOptions.loaderOptions || {
    transpileOnly: true,
  };

  overlayOptions.checkerOptions = overlayOptions.checkerOptions || {};

  return {
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: tsLoaderPath,
            options: overlayOptions.loaderOptions,
          },
          exclude: /node_modules/,
        },
      ],
    },
    plugins: ForkTsCheckerPlugin ? [new ForkTsCheckerPlugin(overlayOptions.checkerOptions)] : [],
  };
}
