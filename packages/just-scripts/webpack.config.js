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
  externals: ['just-task', 'just-task-preset'],
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
    __dirname: false
  },
  stats: 'errors-only'
};
