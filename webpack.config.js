'use strict';

var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker')

var PATHS = {
    app: path.join(__dirname, 'keepspace/static/js'),
    build: path.join(__dirname, 'keepspace/static/build'),
};

module.exports = {
    devtool: 'eval-source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        PATHS.app + '/index.js'
    ],
    output: {
        path: PATHS.build,
        filename: 'main.js',//'[name]-[hash].js',
        publicPath: 'http://localhost:3000/keepspace/static/build/',
    },
    devServer: {
        historyApiFallback: true,
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new BundleTracker({filename: './keepspace/webpack-stats.json'}),
    ],
    eslint: {
        configFile: '.eslintrc',
        failOnWarning: false,
        failOnError: false
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint'
            }
        ],
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel'
            },
            {
                test: /\.json?$/,
                loader: 'json'
            },
            {
                test: /\.scss$/,
                loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]!sass'
            },
            {
                test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.(jpg|png|svg|ttf)$/,
                loader: 'url-loader',
                options: {
                    limit: 25000,
                },
            }
        ]
    }
};
