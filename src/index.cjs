const defaultsDeep = require('lodash.defaultsdeep');
const path = require('path');

/**
 * Make a new webpack configuration object, optionally adding settings to the default configuration.
 * If you need to override a default setting -- for example, completely replacing the `output.library` field -- do
 * that as a separate step after calling this function.
 *
 * Recommended settings include:
 *
 * | Field                           | Description                                   | Example                      |
 * | ------------------------------- | --------------------------------------------- | ---------------------------- |
 * | `additions.target`              | The target environment for this configuration | `node`, `browserslist`, etc. |
 * | `additions.output.library.name` | Your library's name                           | `scratch-foo`                |
 * | `additions.output.path`         | The output directory for this target          | `dist/web`                   |
 *
 * NOTE: The optional `mode` field is treated specially. The `NODE_ENV` environment variable will override any `mode`
 * field in the `additions` parameter.
 *
 * @param {object} options Options for the webpack configuration.
 * @param {string} options.srcPath The absolute path containing the source files.
 * @param {string} [options.libraryName] The name of the library to build. Shorthand for `output.library.name`.
 * @param {import('webpack').Configuration} [options.additions] Settings to add to the base configuration.
 * Aggregates like plugins and module rules will be added to the corresponding properties in the base configuration.
 * @returns {import('webpack').Configuration} a newly-built webpack configuration.
 */
const makeWebpackConfig = ({srcPath, libraryName, additions}) => {
    const isProduction = (process.env.NODE_ENV ?? additions?.mode) === 'production';
    const mode = isProduction ? 'production' : 'development';

    /**
     * @type {import('webpack').Configuration}
     */
    const baseConfig = {
        mode,
        devtool: 'cheap-module-source-map',
        entry: libraryName ? {
            [libraryName]: path.resolve(srcPath, 'index')
        } : path.resolve(srcPath, 'index'),
        optimization: {
            minimize: isProduction
        },
        output: {
            clean: true,
            filename: '[name].js',
            library: {
                name: libraryName,
                type: 'umd2'
            }
        },
        module: {
            rules: [{
                include: srcPath,
                test: /\.jsx?$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        // Use the browserslist setting from package.json
                        '@babel/preset-env'
                    ]
                }
            }]
        },
        plugins: []
    };

    // Merge in scalar fields from `additions` into the base config
    // This also overrides things like `plugins`, but we'll fix that later
    const configuration = defaultsDeep({}, baseConfig, additions);

    // Append base array fields with values from `additions`
    defaultsDeep(configuration, {
        module: {
            rules: [
                ...(baseConfig?.module?.rules ?? []),
                ...(additions?.module?.rules ?? [])
            ]
        },
        plugins: [
            ...(baseConfig?.plugins ?? []),
            ...(additions?.plugins ?? [])
        ]
    });

    // All done!
    return configuration;
}

module.exports = makeWebpackConfig;
