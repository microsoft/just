export * from './tasks';

import * as taskPresets from './task-presets';
export { taskPresets };

export * from './webpack/webpack.config';
export * from './webpack/webpack.serve.config';

// Webpack configs and overlays
import { tsOverlay, TsCheckerOptions, TsLoaderOptions } from './webpack/overlays/tsOverlay';
import { htmlOverlay } from './webpack/overlays/htmlOverlay';
import { stylesOverlay, createStylesOverlay } from './webpack/overlays/stylesOverlay';
import { fileOverlay } from './webpack/overlays/fileOverlay';
import { displayBailoutOverlay } from './webpack/overlays/displayBailoutOverlay';

export const webpackOverlays = {
  typescript: tsOverlay,
  html: htmlOverlay,
  styles: stylesOverlay,
  file: fileOverlay,
  displayBailout: displayBailoutOverlay,
};

export {
  tsOverlay,
  htmlOverlay,
  stylesOverlay,
  fileOverlay,
  displayBailoutOverlay,
  createStylesOverlay,
  TsCheckerOptions,
  TsLoaderOptions,
};

import * as webpackMerge from 'webpack-merge';
export { webpackMerge };

import * as copyInstructions from './copy/CopyInstruction';
export { CopyInstruction, CopyConfig } from './copy/CopyInstruction';
export { copyInstructions };

export * from 'just-task';

export { spawn } from './utils';
