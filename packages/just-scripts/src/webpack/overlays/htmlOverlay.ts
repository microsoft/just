// WARNING: Careful about adding more imports - only import types from externals
import type { Configuration } from 'webpack';
import { tryRequire } from '../../tryRequire';

/**
 * Create an `HTMLWebpackPlugin` config overlay. No-op if `html-webpack-plugin` is not found.
 */
export function htmlOverlay(options: unknown): Configuration {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const HtmlWebpackPlugin: any = tryRequire('html-webpack-plugin');
  if (!HtmlWebpackPlugin) return {};
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    plugins: [new HtmlWebpackPlugin(options)],
  };
}
