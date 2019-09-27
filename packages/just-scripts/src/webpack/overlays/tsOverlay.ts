import ts from 'typescript';
import { tryRequire } from '../../tryRequire';

const ForkTsCheckerPlugin = tryRequire('fork-ts-checker-webpack-plugin');

export interface LoaderOptions {
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

export const tsOverlay = (options: Partial<LoaderOptions> = { transpileOnly: true }) => {
  return {
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options
          },
          exclude: /node_modules/
        }
      ]
    },
    plugins: [...(ForkTsCheckerPlugin ? [new ForkTsCheckerPlugin()] : [])]
  };
};
