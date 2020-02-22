/* eslint-env node */

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const { version } = require('./package.json')

const dist = path.join(__dirname, 'dist')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: dist,
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin([
      { context: '.', from: '*.html' },
      { context: '.', from: '*.css' },
      { context: './assets', from: '*.jpg' },
      { context: './assets', from: '*.png' }
    ]),
    new HtmlWebpackPlugin({
      template: 'index.html',
      version
    })
  ],
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'webpack-glsl-loader'
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    contentBase: dist
  }
}
