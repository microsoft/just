// WARNING: Careful about adding more imports - only import types from externals
import type ts from 'typescript';
import type { Configuration } from 'webpack';
import { resolveWrapper, tryRequire } from '../../tryRequire';

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
  compilerOptions: object;
  eslint: true | undefined;
  /** Options to supply to eslint https://eslint.org/docs/1.0.0/developer-guide/nodejs-api#cliengine */
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

/**
 * Create a typescript module rules config overlay.
 *
 * Required dependencies: `ts-loader` (throws if not found) and implicitly `typescript`.
 * Optional dependencies: `fork-ts-checker-webpack-plugin`.
 */
export function tsOverlay(overlayOptions?: TsOverlayOptions): Partial<Configuration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const ForkTsCheckerPlugin: any = tryRequire('fork-ts-checker-webpack-plugin');

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    plugins: [...(ForkTsCheckerPlugin ? [new ForkTsCheckerPlugin(overlayOptions.checkerOptions)] : [])],
  };
}
