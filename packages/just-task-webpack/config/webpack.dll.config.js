const webpack = require('webpack');
const path = require('path');
const resolve = require('resolve');

const contextPath = path.dirname(resolve.sync('./package.json', { basedir: process.cwd() }));

module.exports = {
  output: {
    filename: 'bundle.js',
    library: '[name]_[hash]',
    path: path.resolve(contextPath, 'dist')
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_[hash]',
      path: path.join(contextPath, 'dist/manifest.json'),
      entryOnly: true
    })
  ],
  mode: 'development'
};
