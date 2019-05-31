import path from 'path';
import merge from 'webpack-merge';
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

export const webpackServeConfig: any = merge(basicWebpackServeConfig, stylesOverlay, tsOverlay, fileOverlay);
