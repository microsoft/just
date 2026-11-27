import { basicWebpackConfig, webpackMerge, htmlOverlay, fileOverlay, tsOverlay, stylesOverlay } from 'just-scripts';

export default () => {
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
