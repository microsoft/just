// // WARNING: Careful about add more imports - only import types from webpack
import type { Configuration } from 'webpack';
import { tryRequire } from '../../tryRequire';

export const htmlOverlay: (options: any) => Partial<Configuration> = options => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const HtmlWebpackPlugin = tryRequire('html-webpack-plugin');
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    plugins: [...(HtmlWebpackPlugin ? [new HtmlWebpackPlugin(options)] : [])],
  };
};
