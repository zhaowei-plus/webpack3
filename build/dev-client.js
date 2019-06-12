const debug = require('debug')('app:server:hot');
const hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true');
/*
* webpack-hot-middleware/client?noInfo=true&reload=true

配置项都有：

path - 中间件为事件流提供的路径
name - 捆绑名称，专门用于多编译器模式
timeout - 尝试重新连接后断开连接后等待的时间
overlay - 设置为false禁用基于DOM的客户端覆盖。
reload - 设置为true在Webpack卡住时自动重新加载页面。
noInfo - 设置为true禁用信息控制台日志记录。
quiet - 设置为true禁用所有控制台日志记录。
dynamicPublicPath - 设置为true使用webpack publicPath作为前缀path。（我们可以__webpack_public_path__在入口点的运行时动态设置，参见output.- publicPath的注释）
autoConnect - 设置为false用于防止从客户端自动打开连接到Webpack后端 - 如果需要使用该setOptionsAndConnect功能修改选项
* */

debug('Creating Hot Hook');
hotClient.subscribe((event) => {
  if (event.action === 'reload') {
    window.location.reload();
  }
});
