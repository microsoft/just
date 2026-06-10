// @ts-check

const { webpackConfig, webpackMerge, htmlOverlay } = require('just-scripts');

module.exports = () => {
  return webpackMerge.merge(webpackConfig(htmlOverlay({})), { devtool: false });
};
