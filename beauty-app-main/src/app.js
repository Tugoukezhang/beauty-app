/**
 * i妆 - 美妆小程序
 * App入口文件
 * @description 负责小程序的生命周期管理和全局数据共享
 */

// 云开发环境配置
const CLOUD_ENV = 'cloud1-1gwwlrl7ac556783';  // 你的云环境ID

// 初始化云开发
wx.cloud.init({
  env: CLOUD_ENV,
  traceUser: true,
});

App({
  // 全局数据
  globalData: {
    userInfo: null,           // 用户信息
    token: null,              // 登录Token
    userId: null,             // 用户ID
    isLogin: false,           // 登录状态
    baseUrl: 'https://api.izhuang.com',  // API基础地址（待配置）
    ossUrl: 'https://your-oss.aliyuncs.com',  // OSS存储地址（待配置）
    cloudEnvId: 'cloud1-1gwwlrl7ac556783',  // 云开发环境ID
  },

  // 小程序初始化
  onLaunch(options) {
    console.log('========== i妆小程序启动 ==========');
    console.log('启动路径:', options.path);
    console.log('启动参数:', options.query);
    console.log('场景值:', options.scene);

    // 检查登录状态
    this.checkLoginStatus();

    // 初始化应用配置
    this.initAppConfig();
  },

  // 小程序显示
  onShow(options) {
    console.log('小程序显示', options);
  },

  // 小程序隐藏
  onHide() {
    console.log('小程序隐藏');
  },

  // 全局错误捕获
  onError(err) {
    console.error('全局错误:', err);
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.userId = userInfo.id;
      this.globalData.isLogin = true;
    } else {
      this.globalData.isLogin = false;
    }
  },

  // 初始化应用配置
  initAppConfig() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
    this.globalData.navBarHeight = systemInfo.platform === 'android' ? 48 : 44;

    // 设置默认分享配置
    this.setShareConfig();
  },

  // 设置分享配置
  setShareConfig() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 登录成功回调
  onLoginSuccess(userInfo, token) {
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    this.globalData.userId = userInfo.id;
    this.globalData.isLogin = true;

    // 存储到本地
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);

    // 通知页面更新
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onLoginSuccess) {
        page.onLoginSuccess(userInfo);
      }
    });

    // 判断是否需要新用户引导
    const onboardingCompleted = wx.getStorageSync('onboardingCompleted');
    if (!onboardingCompleted) {
      wx.navigateTo({ url: '/pages/onboarding/onboarding' });
    }
  },

  // 退出登录
  onLogout() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.userId = null;
    this.globalData.isLogin = false;

    // 清除本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');

    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/login/login'
    });
  },

  // 显示提示
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title,
      icon,
      duration
    });
  },

  // 显示加载
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    });
  },

  // 隐藏加载
  hideLoading() {
    wx.hideLoading();
  },

  // 显示模态框
  showModal(title, content, confirmText = '确定', cancelText = '取消') {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title,
        content,
        confirmText,
        cancelText,
        success(res) {
          resolve(res);
        },
        fail(err) {
          reject(err);
        }
      });
    });
  }
});
