/**
 * 工具函数
 * @description 常用的工具函数封装
 */

/**
 * 格式化日期
 * @param {Date|string|number} date 日期
 * @param {string} format 格式
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 相对时间格式化
 * @param {Date|string|number} date 日期
 */
function formatRelativeTime(date) {
  if (!date) return '';
  
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前';
  } else if (diff < year) {
    return Math.floor(diff / month) + '月前';
  } else {
    return formatDate(date, 'YYYY-MM-DD');
  }
}

/**
 * 格式化价格
 * @param {number} price 价格
 * @param {string} prefix 前缀符号
 */
function formatPrice(price, prefix = '¥') {
  if (price === null || price === undefined) return '';
  return `${prefix}${parseFloat(price).toFixed(2)}`;
}

/**
 * 数字格式化（千分位）
 * @param {number} num 数字
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 手机号脱敏
 * @param {string} phone 手机号
 */
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 节流函数
 * @param {Function} fn 函数
 * @param {number} delay 延迟毫秒
 */
function throttle(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 防抖函数
 * @param {Function} fn 函数
 * @param {number} delay 延迟毫秒
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 深拷贝
 * @param {any} obj 对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 */
function validateEmail(email) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
}

/**
 * 验证密码强度
 * @param {string} password 密码
 */
function validatePassword(password) {
  // 至少8位，包含数字和字母
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

/**
 * 获取图片临时链接（支持云存储）
 * @param {string} cloudId 云存储ID
 */
function getTempFileURL(cloudId) {
  return new Promise((resolve, reject) => {
    if (!cloudId) {
      resolve('');
      return;
    }
    
    // 如果是普通URL，直接返回
    if (cloudId.startsWith('http')) {
      resolve(cloudId);
      return;
    }
    
    // 云存储ID
    wx.cloud.getTempFileURL({
      fileList: [cloudId],
      success: (res) => {
        if (res.fileList[0].status === 0) {
          resolve(res.fileList[0].tempFileURL);
        } else {
          resolve('');
        }
      },
      fail: () => {
        resolve('');
      }
    });
  });
}

/**
 * 选择图片
 * @param {number} count 数量
 * @param {string} sizeType 大小类型
 */
function chooseImage(count = 1, sizeType = ['compressed']) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      sizeType,
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFiles);
      },
      fail: reject
    });
  });
}

/**
 * 选择视频
 */
function chooseVideo() {
  return new Promise((resolve, reject) => {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        resolve(res);
      },
      fail: reject
    });
  });
}

/**
 * 复制到剪贴板
 * @param {string} text 文本
 */
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '复制成功', icon: 'success' });
        resolve();
      },
      fail: reject
    });
  });
}

/**
 * 获取当前位置
 */
function getLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve(res);
      },
      fail: reject
    });
  });
}

/**
 * 拨打电话
 * @param {string} phoneNumber 电话号码
 */
function makePhoneCall(phoneNumber) {
  wx.makePhoneCall({
    phoneNumber,
    fail: () => {
      wx.showToast({ title: '拨打失败', icon: 'none' });
    }
  });
}

/**
 * 页面跳转封装
 * @param {string} url 页面路径
 * @param {Object} params 参数
 */
function navigateTo(url, params = {}) {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  wx.navigateTo({
    url: query ? `${url}?${query}` : url
  });
}

/**
 * 展示内容审核提示
 */
function showAuditTip() {
  wx.showToast({
    title: '内容已提交，请等待审核',
    icon: 'none',
    duration: 2000
  });
}

module.exports = {
  formatDate,
  formatRelativeTime,
  formatPrice,
  formatNumber,
  maskPhone,
  generateId,
  throttle,
  debounce,
  deepClone,
  validatePhone,
  validateEmail,
  validatePassword,
  getTempFileURL,
  chooseImage,
  chooseVideo,
  copyToClipboard,
  getLocation,
  makePhoneCall,
  navigateTo,
  showAuditTip
};
