// // WARNING: Careful about add more imports - only import types from webpack
import { Configuration } from 'webpack';

export const fileOverlay = (): Partial<Configuration> => ({
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
    ],
  },
});
