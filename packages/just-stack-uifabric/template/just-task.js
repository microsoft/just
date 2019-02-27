// @ts-check
const { taskPresets } = require('just-scripts');
const webpack = require('webpack');
module.exports = () => taskPresets.webapp(webpack);
