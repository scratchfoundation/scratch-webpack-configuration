const path = require('path');

const merge = require('lodash.merge');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin")

const DEFAULT_CHUNK_FILENAME = 'chunks/[name].[chunkhash].js';
const DEFAULT_ASSET_FILENAME = 'assets/[name].[hash][ext][query]';

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
     * @param {string|URL} [options.rootPath] The absolute path to the project root.
     * @param {string|URL} [options.distPath] The absolute path to build output. Defaults to `dist` under `rootPath`.
     * @param {string|URL} [options.publicPath] The public location where the output assets will be located. Defaults to `/`.
     * @param {boolean} [options.enableReact] Whether to enable React and JSX support.
     * @param {string} [options.libraryName] The name of the library to build. Shorthand for `output.library.name`.
     * @param {string|URL} [options.srcPath] The absolute path to the source files. Defaults to `src` under `rootPath`.
     * @param {boolean} [options.shouldSplitChunks] Whether to enable spliting code to chunks.
     * @param {RegExp[]} [options.cssModuleExceptions] Optional array of regex rules that exclude matching CSS files from CSS module scoping.
     */
    constructor ({ distPath, enableReact, enableTs, libraryName, rootPath, srcPath, publicPath = '/', shouldSplitChunks, cssModuleExceptions = [] }) {
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
                minimizer: [
                    new TerserPlugin({
                        // Limiting Terser to use only 2 threads. At least for building scratch-gui
                        // this results in a performance gain (from ~60s to ~36s) on a MacBook with
                        // M1 Pro and 32GB of RAM and halving the memory usage (from ~11GB at peaks to ~6GB)
                        parallel: 2
                    })
                ],
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
                assetModuleFilename: DEFAULT_ASSET_FILENAME,
                chunkFilename: DEFAULT_CHUNK_FILENAME,
                path: this._distPath,
                // See https://github.com/scratchfoundation/scratch-editor/pull/25/files/9bc537f9bce35ee327b74bd6715d6c5140f73937#r1763073684
                publicPath,
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
                    ...(enableTs ? ['.ts', '.tsx'] : []),
                    // webpack supports '...' to include defaults, but eslint does not
                    '.js',
                    '.json'
                ]
            },
            module: {
                rules: [
                    {
                        test: enableReact ?
                            (enableTs ? /\.[cm]?[jt]sx?$/ : /\.[cm]?jsx?$/) :
                            (enableTs ? /\.[cm]?[jt]s$/ : /\.[cm]?js$/),
                        loader: 'babel-loader',
                        exclude: [
                            {
                                and: [/node_modules/],

                                // Some scratch pakcages point to their source (as opposed to a pre-built version)
                                // for their browser or webpack target. So we need to process them (at the minimum
                                // to resolve the JSX syntax).
                                not: [/node_modules[\\/]scratch-(paint|render|svg-renderer|vm)[\\/]src[\\/]/]
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
                        // If file output is chosen, it is saved with the default asset module filename.
                        resourceQuery: '?asset',
                        type: 'asset'
                    },
                    {
                        // `asset/resource` emits a separate file and exports the URL.
                        // Previously achievable by using `file-loader`.
                        // Output is saved with the default asset module filename.
                        resourceQuery: /^\?(resource|file)$/,
                        type: 'asset/resource'
                    },
                    {
                        // `asset/inline` exports a data URI of the asset.
                        // Previously achievable by using `url-loader`.
                        // Because the file is inlined, there is no filename.
                        resourceQuery: /^\?(inline|url)$/,
                        type: 'asset/inline'
                    },
                    {
                        // `asset/source` exports the source code of the asset.
                        // Previously achievable by using `raw-loader`.
                        resourceQuery: /^\?(source|raw)$/,
                        type: 'asset/source',
                        generator: {
                            // This filename seems unused, but if it ever gets used,
                            // its extension should not match the asset's extension.
                            filename: DEFAULT_ASSET_FILENAME + '.js'
                        }
                    },
                    {
                        resourceQuery: '?arrayBuffer',
                        type: 'javascript/auto',
                        use: 'arraybuffer-loader'
                    },
                    {
                        test: /\.hex$/,
                        use: [{
                            loader: 'url-loader',
                            options: {
                                limit: 16 * 1024
                            }
                        }]
                    },
                    ...(
                        enableReact ? [
                            {
                                test: /\.css$/,
                                exclude: cssModuleExceptions,
                                use: [
                                    {
                                        loader: 'style-loader'
                                    },
                                    {
                                        loader: 'css-loader',
                                        options: {
                                            modules: {
                                                namedExport: false,
                                                localIdentName: '[name]_[local]_[hash:base64:5]',
                                                exportLocalsConvention: 'camelCase'
                                            },
                                            importLoaders: 1,
                                            esModule: false
                                        }
                                    },
                                    {
                                        loader: 'postcss-loader',
                                        options: {
                                            postcssOptions: {
                                                plugins: [
                                                    'postcss-import',
                                                    'postcss-simple-vars',
                                                    'autoprefixer'
                                                ]
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                test: cssModuleExceptions,
                                use: [
                                    'style-loader',
                                    'css-loader',
                                    {
                                        loader: 'postcss-loader',
                                        options: {
                                            postcssOptions: {
                                                plugins: [
                                                    'postcss-import',
                                                    'postcss-simple-vars',
                                                    'autoprefixer'
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        ] : []
                    ),
                    ...(enableTs ? [{
                        test: enableReact ? /\.[cm]?tsx?$/ : /\.[cm]?ts$/,
                        loader: 'ts-loader',
                        exclude: [/node_modules/]
                    }] : []),
                ],
            },
            plugins: [
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer']
                })
            ]
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
     * Append new externals to the current configuration object.
     * @param {string[]} externals Externals to add.
     * @returns {this}
     */
    addExternals(externals) {
        this._config.externals = (this._config.externals ?? []).concat(externals);
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
