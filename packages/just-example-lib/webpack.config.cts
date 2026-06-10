import { basicWebpackConfig, webpackMerge, htmlOverlay, fileOverlay, tsOverlay, stylesOverlay } from 'just-scripts';

// must use export = for cts loaded directly with node
export = () => {
  return webpackMerge.merge(
    basicWebpackConfig,
    tsOverlay({ checkerOptions: false }),
    fileOverlay(),
    stylesOverlay(),
    htmlOverlay({}),
    {
      devtool: false,
    },
  );
};
