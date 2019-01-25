import path from 'path';
export const webpackConfig = {
  entry: './src/index',
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  mode: 'production',
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
