const path = require('path');

const merge = require('lodash.merge');
const nodeExternals = require('webpack-node-externals');

const DEFAULT_CHUNK_FILENAME = 'chunks/[name].[chunkhash].js';

/**
 * @typedef {import('webpack').Configuration} Configuration
 * @typedef {import('webpack').RuleSetRule} RuleSetRule
 * @typedef {import('webpack').WebpackPluginFunction} WebpackPluginFunction
 * @typedef {import('webpack').WebpackPluginInstance} WebpackPluginInstance
*/

/**
 * @param {string|URL} [path] A file path as a string or `file://` URL.
 * @returns {string|undefined} The file path as a string, or `undefined` if `path` is not a string or `file://` URL.
 */
const toPath = path => {
    if (typeof path === 'string') {
        return path;
    }
    if (path?.protocol === 'file:') {
        return path.pathname;
    }
};

class ScratchWebpackConfigBuilder {
    /**
     * @param {object} options Options for the webpack configuration.
     * @param {string|URL} options.rootPath The absolute path to the project root.
     * @param {string|URL} [options.distPath] The absolute path to build output. Defaults to `dist` under `rootPath`.
     * @param {boolean} [options.enableReact] Whether to enable React and JSX support.
     * @param {string} [options.libraryName] The name of the library to build. Shorthand for `output.library.name`.
     * @param {string|URL} [options.srcPath] The absolute path to the source files. Defaults to `src` under `rootPath`.
     * @param {boolean} [options.shouldSplitChunks] Whether to enable spliting code to chunks.
     */
    constructor ({ distPath, enableReact, libraryName, rootPath, srcPath, shouldSplitChunks}) {
        const isProduction = process.env.NODE_ENV === 'production';
        const mode = isProduction ? 'production' : 'development';

        this._libraryName = libraryName;
        this._rootPath = toPath(rootPath) || '.'; // '.' will cause a webpack error since src must be absolute
        this._srcPath = toPath(srcPath) ?? path.resolve(this._rootPath, 'src');
        this._distPath = toPath(distPath) ?? path.resolve(this._rootPath, 'dist');
        this._shouldSplitChunks = shouldSplitChunks

        /**
         * @type {Configuration}
         */
        this._config = {
            mode,
            devtool: 'cheap-module-source-map',
            entry: libraryName ? {
                [libraryName]: path.resolve(this._srcPath, 'index')
            } : path.resolve(this._srcPath, 'index'),
            optimization: {
                minimize: isProduction,
                ...(
                    shouldSplitChunks ? {
                        splitChunks: {
                            chunks: 'all',
                            filename: DEFAULT_CHUNK_FILENAME,
                        },
                        mergeDuplicateChunks: true
                    } : {}
                )
            },
            output: {
                clean: true,
                filename: '[name].js',
                chunkFilename: DEFAULT_CHUNK_FILENAME,
                path: this._distPath,
                library: {
                    name: libraryName,
                    type: 'umd2'
                }
            },
            resolve: {
                extensions: [
                    '.mjs',
                    '.cjs',
                    ...(
                        enableReact ? [
                            '.mjsx',
                            '.cjsx',
                            '.jsx'
                        ] : []
                    ),
                    // webpack supports '...' to include defaults, but eslint does not
                    '.js',
                    '.json'
                ]
            },
            module: {
                rules: [
                    {
                        test: enableReact ? /\.[cm]?jsx?$/ : /\.[cm]?js$/,
                        loader: 'babel-loader',
                        exclude: [
                            {
                                and: [/node_modules/],
                                not: [/node_modules\/scratch-/]
                            }
                        ],
                        options: {
                            presets: [
                                '@babel/preset-env',
                                ...(
                                    enableReact ? ['@babel/preset-react'] : []
                                )
                            ]
                        }
                    },
                    {
                        // `asset` automatically chooses between exporting a data URI and emitting a separate file.
                        // Previously achievable by using `url-loader` with asset size limit.
                        resourceQuery: /^\?asset$/,
                        type: 'asset'
                    },
                    {
                        // `asset/resource` emits a separate file and exports the URL.
                        // Previously achievable by using `file-loader`.
                        resourceQuery: /^\?(resource|file)$/,
                        type: 'asset/resource'
                    },
                    {
                        // `asset/inline` exports a data URI of the asset.
                        // Previously achievable by using `url-loader`.
                        resourceQuery: /^\?(inline|url)$/,
                        type: 'asset/inline'
                    },
                    {
                        // `asset/source` exports the source code of the asset.
                        // Previously achievable by using `raw-loader`.
                        resourceQuery: /^\?(source|raw)$/,
                        type: 'asset/source'
                    }
                ],

            },
            plugins: []
        };
    }

    /**
     * @returns {ScratchWebpackConfigBuilder} a copy of the current configuration builder.
     */
    clone() {
        return new ScratchWebpackConfigBuilder({
            libraryName: this._libraryName,
            rootPath: this._rootPath,
            srcPath: this._srcPath,
            distPath: this._distPath,
            shouldSplitChunks: this._shouldSplitChunks
        }).merge(this._config);
    }

    /**
     * @returns {Configuration} a copy of the current configuration object.
     */
    get() {
        return merge({}, this._config);
    }

    /**
     * Merge new settings into the current configuration object, overriding existing values.
     * @param {Configuration} overrides Settings to apply.
     * @returns {this}
     */
    merge(overrides) {
        merge(this._config, overrides);
        return this;
    }

    /**
     * Set the target environment for this configuration.
     * @param {string} target The target environment, like `node`, `browserslist`, etc.
     * @returns {this}
     */
    setTarget(target) {
        this._config.target = target;

        if (target.startsWith('node')) {
            this.merge({
                externalsPresets: {node: true},
                externals: [nodeExternals()],
                output: {
                    path: path.resolve(this._distPath, 'node')
                }
            });
        } else if (target.startsWith('browserslist')) {
            this.merge({
                externalsPresets: {web: true},
                output: {
                    path: path.resolve(this._distPath, 'web')
                }
            });
        }

        return this;
    }

    /**
     * Enable the webpack dev server. Probably only useful for web targets.
     * @param {string|number} [port='auto'] The port to listen on, or `'auto'` to use a random port.
     * @returns {this}
     */
    enableDevServer (port = 'auto') {
        return this.merge({
            devServer: {
                client: {
                    overlay: true,
                    progress: true
                },
                port
            }
        });
    }

    /**
     * Add a new rule to `module.rules` in the current configuration object.
     * @param {RuleSetRule} rule The rule to add.
     * @returns {this}
     */
    addModuleRule(rule) {
        return this.merge({
            module: {
                rules: [
                    ...(this._config?.module?.rules ?? []),
                    rule
                ]
            }
        });
    }

    /**
     * Add a new plugin to `plugins` in the current configuration object.
     * @param {WebpackPluginInstance|WebpackPluginFunction} plugin The plugin to add.
     * @returns {this}
     */
    addPlugin(plugin) {
        return this.merge({
            plugins: [
                ...(this._config?.plugins ?? []),
                plugin
            ]
        });
    }
}

module.exports = ScratchWebpackConfigBuilder;
