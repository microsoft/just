// // WARNING: Careful about add more imports - only import types from webpack
import type { Configuration } from 'webpack';
import path from 'path';
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

/**
 * Create a webpack config.
 * For dependencies, see {@link stylesOverlay}, {@link tsOverlay}, and {@link fileOverlay}.
 */
export function webpackConfig(config: Partial<Configuration>): Configuration {
  return merge(basicWebpackConfig, stylesOverlay(), tsOverlay(), fileOverlay(), config);
}
