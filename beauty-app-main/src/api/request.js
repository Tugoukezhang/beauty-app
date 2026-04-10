/**
 * API 请求封装
 * @description 统一处理接口请求，支持拦截器、自动登录、错误处理
 */

const app = getApp();

// API 配置
const API_CONFIG = {
  baseUrl: 'https://api.izhuang.com',  // 待配置
  timeout: 30000,
  successCode: [0, 200, 20000],  // 成功的状态码
};

// 请求队列（用于并发控制）
let requestQueue = [];
const MAX_CONCURRENT = 10;

/**
 * 基础请求方法
 * @param {Object} options 请求配置
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const {
      url = '',
      method = 'GET',
      data = {},
      header = {},
      needAuth = true,
      needLoading = true,
      loadingText = '加载中...'
    } = options;

    // 显示加载
    if (needLoading) {
      wx.showLoading({ title: loadingText, mask: true });
    }

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : API_CONFIG.baseUrl + url;

    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };

    // 添加Token
    if (needAuth && app.globalData.token) {
      requestHeader['Authorization'] = `Bearer ${app.globalData.token}`;
    }

    // 添加时间戳防止缓存
    if (method === 'GET') {
      data._t = Date.now();
    }

    console.log(`[API Request] ${method} ${fullUrl}`, data);

    wx.request({
      url: fullUrl,
      method,
      data,
      header: requestHeader,
      timeout: API_CONFIG.timeout,
      success: (res) => {
        wx.hideLoading();
        console.log(`[API Response] ${fullUrl}`, res.data);

        const { statusCode, data: responseData } = res;

        // HTTP状态码检查
        if (statusCode >= 200 && statusCode < 300) {
          // 业务状态码检查
          if (API_CONFIG.successCode.includes(responseData.code)) {
            resolve(responseData.data);
          } else {
            // token过期
            if (responseData.code === 401) {
              handleTokenExpire();
            }
            reject({
              code: responseData.code,
              message: responseData.message || '请求失败',
              data: responseData.data
            });
          }
        } else {
          // HTTP错误
          handleHttpError(statusCode, res);
          reject({
            code: statusCode,
            message: `网络错误: ${statusCode}`,
            data: null
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error(`[API Error] ${fullUrl}`, err);
        handleNetworkError(err);
        reject({
          code: -1,
          message: '网络请求失败，请检查网络连接',
          data: null
        });
      }
    });
  });
}

/**
 * GET 请求
 */
function get(url, data, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST 请求
 */
function post(url, data, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT 请求
 */
function put(url, data, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE 请求
 */
function del(url, data, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 上传文件
 * @param {Object} options 上传配置
 */
function upload(options) {
  return new Promise((resolve, reject) => {
    const {
      url,
      filePath,
      name = 'file',
      formData = {},
      needLoading = true,
      loadingText = '上传中...'
    } = options;

    if (needLoading) {
      wx.showLoading({ title: loadingText, mask: true });
    }

    const fullUrl = url.startsWith('http') ? url : API_CONFIG.baseUrl + url;

    const header = {};
    if (app.globalData.token) {
      header['Authorization'] = `Bearer ${app.globalData.token}`;
    }

    wx.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        wx.hideLoading();
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data);
        } else {
          reject(data);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        handleNetworkError(err);
        reject(err);
      }
    });
  });
}

/**
 * 下载文件
 * @param {Object} options 下载配置
 */
function download(options) {
  return new Promise((resolve, reject) => {
    const { url, needLoading = true } = options;

    if (needLoading) {
      wx.showLoading({ title: '下载中...', mask: true });
    }

    wx.downloadFile({
      url,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        reject(err);
      }
    });
  });
}

/**
 * 处理Token过期
 */
function handleTokenExpire() {
  console.log('Token已过期，准备跳转登录页...');

  // 清除本地存储
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');

  // 更新全局状态
  app.globalData.token = null;
  app.globalData.userInfo = null;
  app.globalData.isLogin = false;

  // 跳转到登录页
  wx.reLaunch({
    url: '/pages/login/login'
  });
}

/**
 * 处理HTTP错误
 */
function handleHttpError(statusCode, res) {
  let message = '网络错误';

  switch (statusCode) {
    case 400:
      message = '请求参数错误';
      break;
    case 401:
      message = '未授权，请重新登录';
      break;
    case 403:
      message = '拒绝访问';
      break;
    case 404:
      message = '请求地址不存在';
      break;
    case 500:
      message = '服务器错误';
      break;
    case 502:
      message = '网关错误';
      break;
    case 503:
      message = '服务不可用';
      break;
    case 504:
      message = '网关超时';
      break;
    default:
      message = `网络错误: ${statusCode}`;
  }

  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 处理网络错误
 */
function handleNetworkError(err) {
  if (err.errMsg && err.errMsg.includes('request:fail')) {
    wx.showToast({
      title: '网络连接失败，请检查网络',
      icon: 'none',
      duration: 2000
    });
  }
}

// 导出方法
module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  download
};
