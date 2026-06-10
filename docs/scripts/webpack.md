# Webpack

Webpack is the JavaScript, CSS and asset bundler that powers some of the largest web applications. `just-scripts` integrates with Webpack out of the box. Unlike `create-react-app`, it doesn't require ejecting to customize the config, and it tames Webpack's complexity with composable **configs** and **overlays**.

The `webpackTask()` task function runs a production build. It looks for a `webpack.config.{js,cjs,mjs,ts,cts,mts}` file at the root of the project, or you can pass an explicit path via the `config` option.

> For inner loop development with a dev server, use `webpackDevServerTask()`, which resolves `webpack.serve.config.*` (falling back to `webpack.config.*`) using the same set of extensions.

## Example

The config file can be fully customized, but the helpers below get you going quickly. An example `webpack.config.js`:

```js
const { webpackConfig, htmlOverlay } = require('just-scripts');
module.exports = webpackConfig(htmlOverlay());
```

`webpackConfig` builds a complete config; `htmlOverlay()` returns a partial config that's merged in. To assemble a config yourself, use the re-exported `webpack-merge` package: `webpackMerge.merge(...)`.

## Configs

Each `*Config` function returns a complete `Configuration`, pre-merged with the file, styles, and TypeScript overlays plus any config you pass in. The `basicWebpack*Config` objects are the bare bases (entry, mode, output) with no overlays, if you'd rather start from scratch.

- `webpackConfig(config)`: production build config (`mode: 'production'`); accepts custom config to merge in
- `webpackServeConfig(config)`: development serve config (`mode: 'development'`); accepts custom config to merge in
- `basicWebpackConfig`: bare production base object
- `basicWebpackServeConfig`: bare development base object

## Overlays

Each overlay is a function returning a partial `Configuration`. Call it (with options where supported) and merge the result into your config using `webpackMerge.merge()`. Note `webpackConfig`/`webpackServeConfig` already include the file, styles, and TypeScript overlays.

- `fileOverlay()`: loads SVG, PNG, GIF, JPG files via `file-loader` (throws if it isn't installed)
- `htmlOverlay(options)`: injects scripts and assets into a generated `index.html` via `html-webpack-plugin` (no-op if the plugin isn't installed)
- `stylesOverlay()`: adds CSS and Sass support; use `createStylesOverlay(options)` to customize
- `tsOverlay(options)`: adds `ts-loader` for TypeScript, with `fork-ts-checker-webpack-plugin` (if installed) typechecking in a separate process for faster builds
- `displayBailoutOverlay()`: logs Webpack optimization bailout reasons, useful for diagnosing why modules aren't concatenated
