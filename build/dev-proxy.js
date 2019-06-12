// node插件 http-proxy 实现反向代理
const httpProxy = require('http-proxy');

// 新建一个代理 Proxy Server 对象
const proxy = httpProxy.createProxyServer();


const proxyRespJson = require('node-http-proxy-json');

const Promise = require('bluebird');
const request = require('request');

// Nodejs里的 chokidar 模块可以更好的对文件进行监控，不会产生多次的事件
const chokidar = require('chokidar');

const path = require('path');

// 将request所有异步请求，转换成对应的 Promise 版本
Promise.promisifyAll(request);

const _ = require('lodash');

const debug = require('debug')('app:proxy');

const mockDataPath = path.resolve(__dirname, '../mockData');
const proxyConfigPath = path.resolve(__dirname, '../config/proxy.js');

let config = require('../config');

let proxyOptions = config.dev.proxyOptions;

let mockData = {};

// 基础接口对接的校验参数
const baseAuthStr = `Basic ${new Buffer('zcyadmin:vK6olR5IzoceCP8u').toString('base64')}`;
// 调用接口时的校验参数
let authorizationValue = '';

function jsonParse(data) {
  console.log('数据------');
  console.log(data);
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}
// require.cache对象, 代表缓存了所有已被加载模块的缓存区
function loadMockData() {
  try {
    // 清除缓存，需要清除整个目录
    Object.keys(require.cache).forEach((cachePath) => {
      // 以指定字符串开头
      if (cachePath.startsWith(mockDataPath)) {
        delete require.cache[cachePath];
      }
    });

    mockData = require(mockDataPath);
  } catch (error) {
    debug('加载mock数据异常', error);
  }
}

/**
 * oauth接口的url
 */
function getOauthUri() {
  debug('账号：', proxyOptions.user.account, '密码：', proxyOptions.user.password);
  // 返回Token接口
  return `${proxyOptions.rules.uaa.host}/oauth/token?grant_type=password&username=${proxyOptions.user.account}&password=${proxyOptions.user.password}`;
}

/**
 * 获取认证数据
 */
function getAuthorization() {
  // 已经存在，直接返回
  if (authorizationValue) {
    return Promise.resolve(authorizationValue);
  }

  const oauthUri = getOauthUri();
  return request.postAsync({
    uri: oauthUri,
    headers: {
      Authorization: baseAuthStr,
    },
  })
    .then((res) => {
      const data = jsonParse(res.body);
      authorizationValue = `${data.token_type} ${data.access_token}`;
    });
}
// 获取oauth的token
getAuthorization();

function watchMockData() {
  chokidar.watch(mockDataPath).on('change', (filepath) => {
    debug('mock数据变化，重新加载', filepath);
    loadMockData();
  });
}

function watchProxyConfig() {
  chokidar.watch(proxyConfigPath).on('change', (filepath) => {
    debug('proxy配置变化，重新登陆代理', filepath);
    delete require.cache[path.resolve(__dirname, '../config/proxy.js')];
    delete require.cache[path.resolve(__dirname, '../config/index.js')];
    config = require('../config');
    proxyOptions = config.dev.proxyOptions;
    authorizationValue = '';
    getAuthorization();
  });
}

// 加载mock数据
loadMockData();
// 监听mock数据变化
watchMockData();

// 监听proxy配置变化
watchProxyConfig();

// 每小时固定执行，避免Token失效
setInterval(() => {
  authorizationValue = '';
  getAuthorization();
}, 60 * 60 * 1000);

// 捕获异常
proxy.on('error', (err, req, res) => {
  debug('proxy error:', err);
  const callback = mockData[req.path];
  // 传入req，用于部分mock获取request的数据
  const data = callback ? callback(req) : {};

  res.status(200).send(data);
});

// 发起代理请求
proxy.on('proxyReq', (proxyReq) => {
  proxyReq.setHeader('Authorization', authorizationValue);
});
// 请求回复
proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`请求代理状态: ${proxyRes.statusCode}  <==>  path: ${req.path}`);
  const { useMockStatusCode } = proxyOptions;

  if (useMockStatusCode.indexOf(proxyRes.statusCode) !== -1) {
    // 修改header，用于调整res的statusCode为200
    const _writeHead = res.writeHead
    Object.assign(res, {
      writeHead: () => {
        _writeHead.apply(res, [200, proxyRes.headers])
      }
    })

    proxyRespJson(res, proxyRes.headers['content-encoding'], (body) => {
      debug('请求远端服务异常，采用本地mock数据', req.path)
      // 返回mock数据
      const callback = mockData[req.path]
      // 传入req，用于部分mock获取request的数据
      return callback ? callback(req) : {}
    })
  }
});

module.exports = (app) => {
  /**
   * 初始化路由分发
   */
  _.forIn(proxyOptions.rules, (rule, key) => {
    _.forEach(rule.urls, (url) => {
      url && app.all(url, (req, res) => {
        let flag = false
        if (rule.useMock && typeof rule.useMock === 'object') {
          rule.useMock.map((reg) => {
            if (new RegExp(reg).test(req.path)) {
              flag = true
            }
          })
        }
        if (rule.useMock && typeof rule.useMock === 'boolean' || flag) {
          console.log(`请求代理mock数据 <==>  path: ${req.path}`);
          const callback = mockData[req.path];
          // 传入req，用于部分mock获取request的数据
          const data = callback ? callback(req) : {};
          res.status(200).send(data);
          return;
        }
        proxy.web(req, res, { target: rule.host, changeOrigin: true, proxyTimeout: 10*60*1000 });
      });
    });
  });
};
