import path from 'path';
import merge from 'webpack-merge';
import { tsOverlay } from './overlays/tsOverlay';
import { fileOverlay } from './overlays/fileOverlay';
import { displayBailoutOverlay } from './overlays/displayBailoutOverlay';

export const webpackConfig: any = merge(
  {
    entry: './src/index',
    mode: 'production',
    output: {
      path: path.join(process.cwd(), 'dist'),
      filename: 'bundle.js'
    }
  },
  tsOverlay,
  fileOverlay,
  displayBailoutOverlay
);
