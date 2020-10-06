import * as path from 'path';
import merge = require('webpack-merge');
import { tsOverlay } from './overlays/tsOverlay';
import { fileOverlay } from './overlays/fileOverlay';
import { stylesOverlay } from './overlays/stylesOverlay';

export const basicWebpackConfig: any = {
  entry: './src/index',
  mode: 'production',
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'bundle.js'
  }
};

export const webpackConfig = (config: any) => {
  return merge(basicWebpackConfig, stylesOverlay(), tsOverlay(), fileOverlay(), config);
};
