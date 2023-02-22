const webpack = require('webpack');
const preprocess = require("svelte-preprocess")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin')
const path = require('path')
const Dotenv = require('dotenv-webpack')

const mode = process.env.NODE_ENV || 'development'
const prod = mode === 'production'

module.exports = {
    target: 'web',
    entry: './src/index.ts',
    // externals: {
    //     'snarkjs': 'commonjs2 snarkjs',
    //     // '@zk-kit/protocols': 'commonjs2 @zk-kit/protocols',
    // },
    resolve: {
        extensions: ['.ts', '.mjs', '.js', '.svelte'],
        fallback: {
            browserify: require.resolve('browserify'),
            stream: require.resolve('stream-browserify'),
            path: require.resolve('path-browserify'),
            crypto: require.resolve('crypto-browserify'),
            os: require.resolve('os-browserify/browser'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            assert: require.resolve('assert/'),
            constants: false,
            fs: false,
        },
        alias: {
            '$lib': './src/lib',
        },
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].[hash].js',
        chunkFilename: 'js/[name].[hash].js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.svelte$/,
                exclude: /node_modules/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: prod,
                        hotReload: !prod,
                        preprocess: preprocess(),
                        compilerOptions: {
                            dev: !prod,
                        }
                    }
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|.webpack)/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    /**
                     * MiniCssExtractPlugin doesn't support HMR.
                     * For developing, use 'style-loader' instead.
                     * */
                    prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    mode,
    plugins: [
        new Dotenv(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process',
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css'
        }),
        new HtmlWebpackPlugin({
            template: 'static/index.html',
            minify: prod
                ? {
                    collapseWhitespace: true
                }
                : false
        }),
        new PreloadWebpackPlugin({
            rel: 'prefetch'
        })
    ],
    devtool: prod ? false : 'source-map'
}