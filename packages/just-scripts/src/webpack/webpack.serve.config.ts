import * as path from 'path';
import merge = require('webpack-merge');
import { tsOverlay } from './overlays/tsOverlay';
import { fileOverlay } from './overlays/fileOverlay';
import { stylesOverlay } from './overlays/stylesOverlay';

export const basicWebpackServeConfig: any = {
  entry: './src/index',
  mode: 'development',
  output: {
    path: path.join(process.cwd(), 'dist'),
    publicPath: 'dist',
    filename: 'bundle.js'
  }
};

export const webpackServeConfig = (config: any) => {
  return merge(basicWebpackServeConfig, stylesOverlay(), tsOverlay(), fileOverlay(), config);
};
