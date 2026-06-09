// // WARNING: Careful about add more imports - only import types from webpack
import type { Configuration } from 'webpack';
import path from 'path';
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

/**
 * Create a webpack serve config.
 * For dependencies, see {@link stylesOverlay}, {@link tsOverlay}, and {@link fileOverlay}.
 */
export function webpackServeConfig(config: Partial<Configuration>): Configuration {
  return merge(basicWebpackServeConfig, stylesOverlay(), tsOverlay(), fileOverlay(), config);
}
