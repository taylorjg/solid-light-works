module.exports = config => {

  // https://stackoverflow.com/a/71366536
  // https://webpack.js.org/guides/asset-modules/#source-assets
  config.module.rules.push({
    test: /\.glsl$/,
    type: 'asset/source'
  })

  return config
}
