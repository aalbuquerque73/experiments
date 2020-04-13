const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pkg = require('./package.json');

module.exports = {
    entry: {
        app: './src/index.js',
        vendor: Object.keys(pkg.dependencies || {})
    },
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name]-[hash:6].bundle.js',
    },
    plugins: [
        new CleanWebpackPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new HtmlWebpackPlugin({
            title: 'WebGL Example',
        }),
    ],
    optimization: {
        splitChunks: {
            minSize: 1,
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    // cacheGroupKey here is `commons` as the key of the cacheGroup
                    name(module, chunks, cacheGroupKey) {
                        const moduleFileName = path.basename(module.identifier(), '.js');
                        const allChunksNames = chunks.map((item) => item.name).join('~');
                        return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
                    },
                    chunks: 'all'
                },
                json: {
                    test: (module) => module.resource && module.resource.endsWith('.json'),
                    chunks: 'all',
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                        hmr: process.env.NODE_ENV === 'development',
                      },
                    },
                    'style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                      options: {
                        hmr: process.env.NODE_ENV === 'development',
                      },
                    },
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    'resolve-url-loader',
                    // Compiles Sass to CSS
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            sourceMapContents: false
                        },
                    },
                ],
            },
            {
                test: /\.(png|svg|jpg|gif|mp4)$/,
                use: [
                    'file-loader',
                ],
            },
        ],
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
        hot: true,
    },
};
