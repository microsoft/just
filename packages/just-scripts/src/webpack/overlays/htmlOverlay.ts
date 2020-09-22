import { tryRequire } from '../../tryRequire';

export const htmlOverlay = (options: any) => {
  const HtmlWebpackPlugin = tryRequire('html-webpack-plugin');
  return {
    plugins: [...(HtmlWebpackPlugin ? [new HtmlWebpackPlugin(options)] : [])]
  };
};
