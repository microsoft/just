const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node',
  output: {
    filename: 'cli.js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    __dirname: false
  },
  devtool: 'none',
  stats: 'errors-only'
};
