
const path = require('path');
const utils = require('./utils');
const config = require('../config');
const debug = require('debug')('app:config:base');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

debug('创建webpack base配置');

function getPublicPath() {
  switch(process.env.NODE_ENV){
    case 'production': {
      return config.build.assetsPublicPath;
    }
    case 'test': {
      return config.test.assetsPublicPath;
    }
    default:
      return config.dev.assetsPublicPath;
  }
}

module.exports = {
  entry: {
    app: './src/main.js',
    // 获取生产环境下依赖的库
    vendor: Object.keys(packaejson.dependencies),
  },
  output: {
    filename: '[name].js',
    path: config.build.assetsRoot,
    publicPath: getPublicPath(), // 添加资源文件前缀，build 后 放到服务器上
  },
  resolve: {
    extensions: ['.js', '.jsx'], // 配置默认扩展名

    // 别名定义，将目录重命名
    alias: {
      src: resolve('src'),
    },
    // 配置 Webpack 去哪些目录下寻找第三方模块,默认是只会去  node_modules 目录下寻找
    // 例如： import '../../../components/button' 优化之后就可以这样使用 import 'button'
    modules: ['./src/components','node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          // 这里使用了绝对路径
          name: utils.assetsPath('img/[name].[hash:7].[ext]'),
        },
      },
      {
        // 字体打包
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
        },
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ],
  },
};
debug('webpack base配置创建成功');
