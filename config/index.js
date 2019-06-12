const path = require('path')

module.exports = {
  dev: {
    env: require('./dev.env'),
    port: 8083,
    assetsPublicPath: '/',
    assetsSubDirectory: 'assets',
    autoOpenBrowser: true,
    cssSourceMap: false,
    devtool: 'cheap-module-eval-source-map',
    bundleAnalyzerReport: true,
    // proxyOptions: require('./proxy')
  },
  test: {
    env: require('./prod.env'),
    assetsPublicPath: '/',
    assetsSubDirectory: 'template_assets', // 需修改
  },
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsPublicPath: 'https://sitecdn.zcy.gov.cn/',
    assetsSubDirectory: 'template_assets', // 需修改
    productionSourceMap: true,
    devtool: '#source-map'
  }
}