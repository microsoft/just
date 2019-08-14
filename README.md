# just demo

## 1. create a react app

```
yarn create just reactapp
cd reactapp
yarn start
```

add a task:

```js
const { taskPresets, task, series, option, argv, condition } = require('just-scripts');

taskPresets.webapp();

option('sayhello');

task('sayhello', () => {
  console.log('HELLLLLLOOOOOOOOOOOOOO');
});

task('build', series(task('build'), condition('sayhello', () => argv().sayhello)));
```

## 2. create a uifabric app

```
yarn create uifabric fabricapp
cd fabricapp
yarn start
```

## 3. customize the webpack.config.js

edit the `webpack.config.js`

```
yarn add -D nyan-progress-webpack-plugin
```

```js
const { webpackConfig, webpackMerge, htmlOverlay } = require('just-scripts');
const NyanPlugin = require('nyan-progress-webpack-plugin');

module.exports = webpackMerge(
  webpackConfig,
  htmlOverlay({
    template: 'public/index.html'
  }),
  {
    plugins: [new NyanPlugin()]
  }
);
```

## 4. generate a monorepo

```
yarn create just monorepo
cd monorepo
```

## 5. generate app inside monorepo

```
yarn gen app
yarn
cd packages/app
yarn start
```

## 6. modify template and generate a component

1. modify plop-templates/components/component.tsx.hbs

```
import React from 'react';

export interface {{pascalCase componentName}}Props {
  // Fill in props here
}

export const {{pascalCase componentName}} = (props: {{pascalCase componentName}}Props) => {
  return (
    <div>
      Hi I'm from {{pascalCase componentName}}!
    </div>
  );
}
```

```
cd packages/app
yarn gen Foo
yarn start
```

2. look inside Foo.tsx

3. modify the App.tsx:

```tsx
import React from 'react';
import { Foo } from './components/Foo';

export default () => (
  <div>
    This is a <Foo />
  </div>
);
```
