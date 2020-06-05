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
    new CopyWebpackPlugin({
      patterns: [
        { context: './src', from: '*.html' },
        { context: './src', from: '*.css' },
        { context: './src/assets', from: '*.jpg' },
        { context: './src/assets', from: '*.png' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
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
