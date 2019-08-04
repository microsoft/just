const { webpackConfig, webpackMerge, htmlOverlay } = require('just-scripts');

console.dir(
  JSON.stringify(
    htmlOverlay({
      template: 'public/index.html'
    }),
    null,
    2
  )
);
module.exports = webpackMerge(
  webpackConfig,
  htmlOverlay({
    template: 'public/index.html'
  }),
  {
    // Here you can custom webpack configurations
  }
);
