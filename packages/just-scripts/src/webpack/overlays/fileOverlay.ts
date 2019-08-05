export const fileOverlay = () => ({
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  }
});

// @deprecated - we used to give default options only, now we use functions as a convention
fileOverlay.module = fileOverlay().module;
