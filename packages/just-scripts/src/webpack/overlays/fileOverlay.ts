// WARNING: Careful about adding more imports - only import types from externals
import type { Configuration } from 'webpack';
import { resolveWrapper } from '../../tryRequire';

/**
 * Get a config overlay with rules for loading image files with `file-loader`.
 * Throws if `file-loader` is not found.
 */
export function fileOverlay(): Configuration {
  const fileLoaderPath = resolveWrapper('file-loader');
  if (!fileLoaderPath) {
    throw new Error('Could not find "file-loader". Please install this package.');
  }
  return {
    module: {
      rules: [
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [fileLoaderPath],
        },
      ],
    },
  };
}
