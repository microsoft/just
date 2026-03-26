// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';
import { tryRequire } from '../../tryRequire';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const htmlOverlay = (options: any): Partial<Configuration> => {
  const HtmlWebpackPlugin = tryRequire<typeof import('html-webpack-plugin')['default']>('html-webpack-plugin');
  return {
    plugins: [...(HtmlWebpackPlugin ? [new HtmlWebpackPlugin(options)] : [])],
  };
};
