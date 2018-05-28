/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const packageJson = require('./package.json');

const dist = path.join(__dirname, 'dist');

module.exports = {
    entry: [
        './index.js'
    ],
    output: {
        path: dist,
        filename: 'bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin([
            { context: '.', from: '*.html' },
            { context: '.', from: '*.css' }
        ]),
        new HtmlWebpackPlugin({
            template: 'index.html',
            version: packageJson.version
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        contentBase: dist
    }
};
