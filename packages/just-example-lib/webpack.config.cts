import { webpackConfig, webpackMerge, htmlOverlay } from 'just-scripts';

// must use export = for cts loaded directly with node
export = () => {
  return webpackMerge.merge(webpackConfig(htmlOverlay({})), { devtool: false });
};
