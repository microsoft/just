import path from 'path';
export const webpackServeConfig = {
  entry: './src/index',
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'bundle.js'
  }
};
