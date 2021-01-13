// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import * as path from 'path';
import { merge } from 'webpack-merge';
import { tsOverlay } from './overlays/tsOverlay';
import { fileOverlay } from './overlays/fileOverlay';
import { stylesOverlay } from './overlays/stylesOverlay';

export const basicWebpackServeConfig: Configuration = {
  entry: './src/index',
  mode: 'development',
  output: {
    path: path.join(process.cwd(), 'dist'),
    publicPath: 'dist',
    filename: 'bundle.js',
  },
};

export const webpackServeConfig = (config: Partial<Configuration>): Configuration => {
  return merge(basicWebpackServeConfig, stylesOverlay(), tsOverlay(), fileOverlay(), config);
};
