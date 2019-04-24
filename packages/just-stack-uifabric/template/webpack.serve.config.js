const { webpackMerge, htmlWebpackPluginConfig, webpackServeConfig } = require('just-scripts');
module.exports = webpackMerge(webpackServeConfig, htmlWebpackPluginConfig);
