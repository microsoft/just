// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import * as path from 'path';
import { merge } from 'webpack-merge';
import { tsOverlay } from './overlays/tsOverlay';
import { fileOverlay } from './overlays/fileOverlay';
import { stylesOverlay } from './overlays/stylesOverlay';

export const basicWebpackConfig: Configuration = {
  entry: './src/index',
  mode: 'production',
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'bundle.js',
  },
};

export const webpackConfig = (config: Partial<Configuration>): Configuration => {
  return merge(basicWebpackConfig, stylesOverlay(), tsOverlay(), fileOverlay(), config);
};
