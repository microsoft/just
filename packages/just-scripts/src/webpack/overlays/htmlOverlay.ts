import { tryRequire } from '../../tryRequire';

const HtmlWebpackPlugin = tryRequire('html-webpack-plugin');

export const htmlOverlay = {
  plugins: [...(HtmlWebpackPlugin ? [new HtmlWebpackPlugin()] : [])]
};
