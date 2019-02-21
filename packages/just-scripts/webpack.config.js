const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /__tests__/]
      }
    ]
  },
  // External tools are imported by the consumers
  externals: [
    'just-task',
    '@microsoft/api-extractor',
    'autoprefixer',
    'postcss',
    'node-sass',
    'webpack'
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'commonjs2'
  },
  node: {
    __dirname: false,
    process: false
  },
  stats: 'errors-only'
};
