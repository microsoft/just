import { tryRequire } from '../../tryRequire';

const HtmlWebpackPlugin = tryRequire('html-webpack-plugin');

export const htmlOverlay = (options: any) => ({
  plugins: [...(HtmlWebpackPlugin ? [new HtmlWebpackPlugin(options)] : [])]
});
