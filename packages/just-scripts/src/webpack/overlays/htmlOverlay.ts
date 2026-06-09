// WARNING: Careful about adding more imports - only import types from externals
import type HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';
import { tryRequire } from '../../tryRequire';

/**
 * Create an `HTMLWebpackPlugin` config overlay. No-op if `html-webpack-plugin` is not found.
 */
export function htmlOverlay(options: HtmlWebpackPlugin.Options): Configuration {
  const HtmlWebpackPlugin = tryRequire<typeof import('html-webpack-plugin')>('html-webpack-plugin');
  if (!HtmlWebpackPlugin) return {};

  return {
    plugins: [new HtmlWebpackPlugin(options)],
  };
}
