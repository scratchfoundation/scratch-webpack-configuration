# scratch-webpack-configuration

Shared configuration for Scratch's use of webpack

## Usage

Add something like this to your `webpack.config.*js` file:

```javascript
import ScratchWebpackConfigBuilder from 'scratch-webpack-configuration';

const builder = new ScratchWebpackConfigBuilder(
    {
        rootPath: __dirname,
        enableReact: true
    })
    .setTarget('browserslist')
    .addModuleRule({
        test: /\.css$/,
        use: [/* CSS loaders */]
    })
    .addPlugin(new CopyWebpackPlugin({
        patterns: [/* CopyWebpackPlugin patterns */]
    });

if (process.env.FOO === 'bar') {
    builder.addPlugin(new MyCustomPlugin());
}

module.exports = builder.get();
```

Call `addModuleRule` and `addPlugin` as few or as many times as needed. If you need multiple configurations, you can
use `clone()` to share a base configuration and then add or override settings:

```javascript
const baseConfig = new ScratchWebpackConfigBuilder({rootPath: __dirname, libraryName: 'my-library'})
    .addModuleRule({
        test: /\.foo$/,
        use: [/* FOO loaders */]
    });

const config1 = baseConfig.clone()
    .setTarget('browserslist')
    .merge({/* arbitrary configuration */})
    .addPlugin(new MyCustomPlugin('hi'));

const config2 = baseConfig.clone()
    .setTarget('node')
    .addPlugin(new MyCustomPlugin('hello'));

module.exports = [
    config1.get(),
    config2.get()
];
```

## What it does

- Sets up a default configuration that is suitable for most Scratch projects
  - Use `enableReact` to enable React support
  - Target `node` or `browserslist` (more targets will be added as needed)
- Adds `babel-loader` with the `@babel/preset-env` preset
  - Adds `@babel/preset-react` if React support is enabled
- Adds target-specific presets for `webpack` 5's `externals` and `externalsPresets` settings
- Target-specific output directory under `dist/`
  - `browserslist` builds to `dist/web/`
  - `node` builds to `dist/node/`
- Supports merging in arbitrary configuration with `merge({...})`

### Asset Modules

This configuration makes webpack 5's [Asset Modules](https://webpack.js.org/guides/asset-modules/) available through
resource queries parameters:

```js
import myImage from './my-image.png?asset'; // Use `asset` (let webpack decide)
import myImage from './my-image.png?resource'; // Use `asset/resource`, similar to `file-loader`
import myImage from './my-image.png?inline'; // Use `asset/inline`, similar to `url-loader`
import myImage from './my-image.png?source'; // Use `asset/source`, similar to `raw-loader`
```

You can also use `file` for `asset/resource`, `url` for `asset/inline`, and `raw` for `asset/source`, to make it clear
which loader you're replacing.

## API

### `new ScratchWebpackConfigBuilder(options)`

Creates a new `ScratchWebpackConfigBuilder` instance.

#### `options`

Required:

- `rootPath` (string, required): The root path of the project. This is used to establish defaults for other paths.

Optional:

- `distPath` (string, default: `path.join(rootPath, 'dist')`): The path to the output directory. Defaults to `dist`
- `enableReact` (boolean, default: `false`): Whether to enable React support. Adds `.jsx` to the list of extensions
  to process, and adjusts Babel settings.
- `libraryName` (string, default: `undefined`): If set, configures a default entry point and output library name.
  under the root path.
- `srcPath` (string, default: `path.join(rootPath, 'src')`): The path to the source directory. Defaults to `src`
  under the root path.

## Recommended Configuration

### Package exports

_The `exports` field in `package.json`_

Most `project.json` files specify a `main` entry point, and some specify `browser` as well. Newer versions of Node
support the `exports` field as well. If both are present, `exports` will take precedence.

For more information about `exports`, see: <https://webpack.js.org/guides/package-exports/>, especially the "Target
environment" section.

Unfortunately, plenty of tools don't support `exports` yet, and some that do exhibit some surprising quirks.

Here's what I currently recommend for a project with only one entry point:

```json
{
  "main": "./dist/node/foo.js",
  "browser": "./dist/web/foo.js",
  "exports": {
    "webpack": "./src/index.js",
    "browser": "./dist/web/foo.js",
    "node": "./dist/node/foo.js",
    "default": "./src/index.js"
  },
}
```

- `main` supports older Node as well as `jest`
- `browser` is present for completeness; I haven't found it strictly necessary
- `exports.webpack` is the entry point for Webpack
  - `webpack` will grab the first item under `exports` matching its conditions, including `browser`, so I recommend
    listing `exports.webpack` first in the `exports` object
  - this allows (for example) `scratch-gui` to build `scratch-vm` from source rather than using the prebuilt version,
    resulting in more optimal output and preventing version conflicts due to bundled dependencies
- `exports.default` makes `eslint` happy
- `exports.browser` and `exports.node` prevent `exports`-aware tools from using `exports.default` for all contexts

Note that using `src/index.js` for the `webpack` and `default` exports means that the NPM package must include `src`.

### `browserslist` target

While it could be handy to include `browserslist` configuration in this package, there are tools other than `webpack`
that should use the same `browserslist` configuration. For that reason, I recommend configuring `browserslist` in
your `package.json` file or in a top-level `.browserslistrc` file.

The Scratch system requirements determine the browsers we should target. That information can be found here:
<https://scratch.mit.edu/faq>
