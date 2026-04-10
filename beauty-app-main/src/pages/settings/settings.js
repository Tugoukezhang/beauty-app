/**
 * 设置页面
 * 功能：账号安全、通知设置、清除缓存、关于我们、退出登录
 */

const userApi = require('../../api/user');

Page({
  data: {
    userInfo: null,
    cacheSize: '0KB',
    version: '1.0.0'
  },

  onLoad() {
    this.loadUserInfo();
    this.calculateCacheSize();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo });
  },

  // 计算缓存大小
  calculateCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        const sizeKB = res.currentSize;
        let sizeStr = '';
        if (sizeKB > 1024) {
          sizeStr = (sizeKB / 1024).toFixed(2) + 'MB';
        } else {
          sizeStr = sizeKB + 'KB';
        }
        this.setData({ cacheSize: sizeStr });
      }
    });
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '清除中...' });
          wx.clearStorage({
            success: () => {
              wx.hideLoading();
              wx.showToast({ title: '清除成功', icon: 'success' });
              this.setData({ cacheSize: '0KB' });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '清除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 修改手机号
  changePhone() {
    wx.navigateTo({ url: '/pages/settings/changePhone/changePhone' });
  },

  // 修改密码
  changePassword() {
    wx.navigateTo({ url: '/pages/settings/changePassword/changePassword' });
  },

  // 通知设置
  notificationSettings() {
    wx.navigateTo({ url: '/pages/settings/notification/notification' });
  },

  // 隐私设置
  privacySettings() {
    wx.navigateTo({ url: '/pages/settings/privacy/privacy' });
  },

  // 关于我们
  aboutUs() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  // 用户协议
  userProtocol() {
    wx.navigateTo({ url: '/pages/protocol/protocol' });
  },

  // 隐私政策
  privacyPolicy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userId');

          // 跳转到登录页
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  }
});
