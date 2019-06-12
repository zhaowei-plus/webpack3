
const utils = require('./utils');
const path = require('path');
const webpack = require('webpack');
const config = require('../config');

const debug = require('debug')('app:config:dev');
const baseWebpackConfig = require('./webpack.base.conf');

// 生成HTML入口文件，单入口／多入口
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 打包样式文件
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// 配置合并
const merge = require('webpack-merge');

// 入口文件配置
Object.keys(baseWebpackConfig.entry).forEach((name) => {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name]);
});

debug(`合并webpack ${config.dev.env.NODE_ENV} 环境配置`);

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true,
    }),
  },
  devtool: config.dev.devtool,
  plugins: [
    // 自定义编译时可配置的全局变量，以便区分开发模式和发布模式
    new webpack.DefinePlugin({
      'process.env': config.dev.env,
      __DEV__: true,
    }),

    // $ 会自动添加到当前模块的上下文，无需显示声明
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),

    // 当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境
    new webpack.NamedModulesPlugin(),

    // 热模块替换
    new webpack.HotModuleReplacementPlugin(),

    // 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资
    // 源不会包含错误。对于所有资源，统计资料(stat)的 emitted 标识都是 false。
    // 启用此插件后，webpack 进程遇到错误代码将不会退出
    new webpack.NoEmitOnErrorsPlugin(),

    // 主要是用来提取第三方库和公共模块，避免首屏加载的bundle文件或者按需加载的bundle文件体积过大，从而导致加载时间过长，是优化的一把利器
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor', /* 提取出来chunk的名字 */
      filename: '[name].js', // 生成公共文件的文件名，如果不配置，默认的output里面的filename
      /*
      * minChunks:
      *   number - 模块被调用多少次才被认为是公共模块，默认为chunks的数量
      *   Infinity - 生成的公共文件只包含webpack运行代码，不包含其他的模块
      *
      *   function(module, count) => boolean - 设置特定的模块，webpack会遍历工程的所有模块调用该函数，并作为module传入, 只要匹配（return true），该模块就会被编译进公共js中
      * */
      minChunks(module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource && /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        );
      },
      // chunks：用于从公共模块当中再进行抽取。如vue工程配置由app.js，vendor.js，manifest.js，
    }),

    // 提取公共文件：
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),

    // 打包多个文件
    new HtmlWebpackPlugin({
      title: 'webpack测试',
      filename: 'index.html',
      template: './src/index.hbs',
      inject: true,
      minify: {
        removeAttributeQuotes: true
      },
      cache: true,
      chunks: ['index','devor'],
    }),
  ],
});

// 打开模块预览
if (config.dev.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  devWebpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

debug(`合并webpack ${config.dev.env.NODE_ENV} 环境配置成功`);
module.exports = devWebpackConfig;
