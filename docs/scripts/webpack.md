# Webpack

Webpack is the Javascript, CSS and asset bundler that powers some of the largest Web applications. Just Scripts comes with great integration with Webpack out of the box. All of the power of Webpack comes at the cost of complexity in its configuration. The bundler actually comes with great defaults. However, it takes some non-trivial amount of config to make it work with transpilers like TypeScript.

`just-scripts` exports a flexible Webpack `just-task` task function. Unlike `create-react-app`, `just-scripts` does not require ejecting to allow customizations of the Webpack configuration. `just-scripts` abstracts the complexity of the configuration with what is known as "Overlays". For example, to add support of TypeScript transpilation, several parts of the configuration needs to be changed to support the various parts of building with TypeScript.

This task function will look for two files at the root of the project:

- webpack.config.js
- webpack.serve.config.js

The Webpack task function will use `webpack.config.js` for its optimized production builds. It will use the `webpack.serve.config.js` for innerloop development.

## Example `webpack.config.js` and `webpack.serve.config.js`

The `webpack.config.js` and `webpack.serve.config.js` can be completely customized to your own needs. However, some great utilities from `just-scripts` make it really easy to get going. Take a look at an example `webpack.config.js` that uses these utilities:

```ts
const { webpackMerge, htmlOverlay, webpackServeConfig } = require('just-scripts');
module.exports = webpackMerge(webpackServeConfig, htmlOverlay);
```

From this example, several concepts are illustrated. First, you can see that `just-scripts` exposes:

- `webpackMerge`: this is just a thin wrapper on top of the excellent `webpack-merge` package
- `webpackServeConfig`: this a very basic preset configuration that you can use as a baseline, there is also a `webpackConfig` module exported that you can use for your `webpack.config.js`
- `htmlOverlay`: this is one of the overlays that adds some functionality to Webpack to be merged by the `webpack-merge` utility

## Overlays

These overlays are not configurable (for now), but they do provide a great baseline to start from.

- `fileOverlay`: This adds the `file-loader` to allow loading SVG, PNG, GIF, JPG files
- `htmlOverlay`: This adds the `html-webpack-plugin` that generates the right code to include scripts and other assets into your `index.html`
- `stylesOverlay`: This adds styling support for both CSS and Sass
- `tsOverlay`: This adds a `ts-loader` transpilation support for TypeScript files while configuring a `fork-ts-checker-webpack-plugin` for typechecking in a separate process for the fastest compilation experience
