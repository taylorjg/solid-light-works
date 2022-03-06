/* eslint-env node */

const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const packageJson = require('./package.json')

const BUILD_FOLDER = path.join(__dirname, 'build')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: BUILD_FOLDER,
    filename: 'bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { context: './src', from: '*.css' },
        { context: './src/assets', from: '*.jpg' },
        { context: './src/assets', from: '*.png' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      version: packageJson.version
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
  devtool: 'source-map'
}
