import { tryRequire } from '../../tryRequire';

const ForkTsCheckerPlugin = tryRequire('fork-ts-checker-webpack-plugin');

export const tsOverlay = {
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [...(ForkTsCheckerPlugin ? [new ForkTsCheckerPlugin()] : [])]
};
