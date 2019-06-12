// 版本检查
require('./check-versions')();

// 主要用来实现node.js命令行环境的loading效果，和显示各种状态的图标等
const ora = require('ora');
// rimraf 包的作用：以包的形式包装rm -rf命令，用来删除文件和文件夹的，不管文件夹是否为空，都可删除
const rm = require('rimraf');
const path = require('path');

// 颜色插件
const chalk = require('chalk');
const webpack = require('webpack');
const config = require('../config');
const webpackConfig = require('./webpack.prod.conf');

const spinner = ora('building for production...');
spinner.start();

// 删除目录
rm(config.build.assetsRoot, (err) => {
  if (err) throw err;

  // 运行 webpack 配置
  webpack(webpackConfig, (err, stats) => {
    spinner.stop();
    if (err) throw err;

    // 指向标准输出流(stdout)的 可写的流(Writable Stream)
    process.stdout.write(`${stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    })}\n\n`);

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'));
      process.exit(1);
    }

    console.log(chalk.cyan('  Build complete.\n'));
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ));
  });
});
