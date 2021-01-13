import * as ts from 'typescript';
// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import { tryRequire } from '../../tryRequire';

export interface TsLoaderOptions {
  configFile: string;
  transpileOnly: boolean;
  onlyCompileBundledFiles: boolean;
  colors: boolean;
  compilerOptions: ts.CompilerOptions;
  happyPackMode: boolean;
  getCustomTransformers: string | ((program: ts.Program) => ts.CustomTransformers | undefined);
  experimentalWatchApi: boolean;
  allowTsInNodeModules: boolean;
  experimentalFileCaching: boolean;
  projectReferences: boolean;
}

export interface TsCheckerOptions {
  typescript: string;
  tsconfig: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  compilerOptions: object;
  tslint: string | true | undefined;
  tslintAutoFix: boolean;
  eslint: true | undefined;
  /** Options to supply to eslint https://eslint.org/docs/1.0.0/developer-guide/nodejs-api#cliengine */
  // eslint-disable-next-line @typescript-eslint/ban-types
  eslintOptions: object;
  watch: string | string[];
  async: boolean;
  ignoreDiagnostics: number[];
  ignoreLints: string[];
  ignoreLintWarnings: boolean;
  reportFiles: string[];
  colors: boolean;
  silent: boolean;
  checkSyntacticErrors: boolean;
  memoryLimit: number;
  workers: number;
  vue: boolean;
  useTypescriptIncrementalApi: boolean;
  measureCompilationTime: boolean;
  resolveModuleNameModule: string;
  resolveTypeReferenceDirectiveModule: string;
}

export interface TsOverlayOptions {
  loaderOptions?: Partial<TsLoaderOptions>;
  checkerOptions?: Partial<TsCheckerOptions>;
}

export const tsOverlay = (overlayOptions?: TsOverlayOptions): Partial<Configuration> => {
  const ForkTsCheckerPlugin = tryRequire('fork-ts-checker-webpack-plugin');

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
            loader: 'ts-loader',
            options: overlayOptions.loaderOptions,
          },
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [...(ForkTsCheckerPlugin ? [new ForkTsCheckerPlugin(overlayOptions.checkerOptions)] : [])],
  };
};
