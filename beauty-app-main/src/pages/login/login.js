/**
 * 美妆小程序 - 登录页面
 * 功能：手机号登录、微信授权登录、用户协议
 */

const API = require('../../utils/index');
const userApi = require('../../api/user');

Page({
  data: {
    // 登录方式
    loginType: 'phone', // 'phone' | 'wechat'
    phone: '',
    verifyCode: '',
    countdown: 0,
    countdownText: '获取验证码',
    agreeProtocol: false,
    // 微信登录相关
    wechatLoginLoading: false,
    // 表单状态
    loading: false,
    errorMessage: ''
  },

  onLoad(options) {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  // 切换登录方式
  switchLoginType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ loginType: type, errorMessage: '' });
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  // 验证码输入
  onVerifyCodeInput(e) {
    this.setData({ verifyCode: e.detail.value });
  },

  // 获取验证码
  async getVerifyCode() {
    const { phone } = this.data;

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({ errorMessage: '请输入正确的手机号' });
      return;
    }

    // 开始倒计时
    this.setData({ countdown: 60, loading: true });

    try {
      await userApi.sendVerifyCode({ phone });
      this.startCountdown();
    } catch (err) {
      this.setData({ errorMessage: err.message || '发送失败，请重试', loading: false, countdown: 0 });
    }
  },

  // 倒计时
  startCountdown() {
    const timer = setInterval(() => {
      const { countdown } = this.data;
      if (countdown <= 1) {
        clearInterval(timer);
        this.setData({ countdown: 0, countdownText: '获取验证码', loading: false });
      } else {
        this.setData({ countdown: countdown - 1, countdownText: `${countdown - 1}秒后重试` });
      }
    }, 1000);
  },

  // 同意协议
  onAgreeChange(e) {
    this.setData({ agreeProtocol: e.detail.value.length > 0 });
  },

  // 手机号登录
  async phoneLogin() {
    const { phone, verifyCode, agreeProtocol } = this.data;

    // 验证输入
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({ errorMessage: '请输入正确的手机号' });
      return;
    }

    if (!verifyCode || verifyCode.length !== 6) {
      this.setData({ errorMessage: '请输入6位验证码' });
      return;
    }

    if (!agreeProtocol) {
      this.setData({ errorMessage: '请先同意用户协议和隐私政策' });
      return;
    }

    this.setData({ loading: true, errorMessage: '' });

    try {
      const result = await userApi.phoneLogin({
        phone,
        code: verifyCode
      });

      this.handleLoginSuccess(result);
    } catch (err) {
      this.setData({ errorMessage: err.message || '登录失败，请重试', loading: false });
    }
  },

  // 微信一键登录
  async wechatLogin() {
    this.setData({ wechatLoginLoading: true, errorMessage: '' });

    try {
      // 获取微信手机号
      const phoneNumber = await this.getWechatPhoneNumber();

      if (phoneNumber) {
        // 微信授权登录
        const result = await userApi.wechatLogin({ phoneNumber });
        this.handleLoginSuccess(result);
      }
    } catch (err) {
      this.setData({ errorMessage: err.message || '微信登录失败', wechatLoginLoading: false });
    }
  },

  // 获取微信手机号
  getWechatPhoneNumber() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (res) => {
          if (res.code) {
            try {
              const result = await userApi.getWxPhoneNumber({ code: res.code });
              resolve(result.phoneNumber);
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error('获取code失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 处理登录成功
  handleLoginSuccess(result) {
    // 保存token和用户信息
    wx.setStorageSync('token', result.token);
    wx.setStorageSync('userInfo', result.userInfo);
    wx.setStorageSync('userId', result.userInfo.id);

    this.setData({ loading: false, wechatLoginLoading: false });

    // 判断是否需要新用户引导
    const onboardingCompleted = wx.getStorageSync('onboardingCompleted');
    if (!onboardingCompleted) {
      // 新用户 → 引导问卷
      wx.redirectTo({ url: '/pages/onboarding/onboarding' });
    } else {
      // 老用户 → 首页
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  // 查看用户协议
  viewProtocol() {
    wx.navigateTo({ url: '/pages/protocol/protocol' });
  },

  // 查看隐私政策
  viewPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },

  // 调试：模拟登录
  async debugLogin() {
    const mockUserInfo = {
      id: 1001,
      nickname: '测试用户',
      avatar: '/assets/images/avatar-default.png',
      phone: '13800138000',
      isVip: false,
      vipExpireTime: null,
      balance: 0,
      points: 0
    };

    wx.setStorageSync('token', 'mock_token_' + Date.now());
    wx.setStorageSync('userInfo', mockUserInfo);
    wx.setStorageSync('userId', mockUserInfo.id);

    // 判断是否需要新用户引导
    const onboardingCompleted = wx.getStorageSync('onboardingCompleted');
    if (!onboardingCompleted) {
      wx.redirectTo({ url: '/pages/onboarding/onboarding' });
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  }
});
