/**
 * 个人中心页面
 * 功能：用户信息展示、VIP状态、钱包、功能入口
 */

const userApi = require('../../api/user');

Page({
  data: {
    userInfo: null,
    isLogin: false,
    isVip: false,
    vipExpireTime: '',
    stats: {
      courseCount: 0,
      favoriteCount: 0,
      points: 0,
      balance: 0
    },
    menuItems: [
      [
        { id: 'favorites', name: '我的收藏', icon: '/assets/icons/icon-favorite.png', path: '/pages/favorites/favorites' },
        { id: 'studyRecord', name: '学习记录', icon: '/assets/icons/icon-record.png', path: '/pages/studyRecord/studyRecord' },
        { id: 'coupon', name: '优惠券', icon: '/assets/icons/icon-coupon.png', path: '/pages/coupon/coupon' },
        { id: 'order', name: '我的订单', icon: '/assets/icons/icon-order.png', path: '/pages/order/order' }
      ],
      [
        { id: 'vip', name: '会员中心', icon: '/assets/icons/icon-vip.png', path: '/pages/vip/vip' },
        { id: 'wallet', name: '我的钱包', icon: '/assets/icons/icon-wallet.png', path: '/pages/recharge/recharge' },
        { id: 'task', name: '每日任务', icon: '/assets/icons/icon-task.png', path: '/pages/task/task' },
        { id: 'invite', name: '邀请好友', icon: '/assets/icons/icon-invite.png', path: '/pages/invite/invite' }
      ],
      [
        { id: 'feedback', name: '意见反馈', icon: '/assets/icons/icon-feedback.png', path: '/pages/feedback/feedback' },
        { id: 'customerService', name: '联系客服', icon: '/assets/icons/icon-service.png', path: '/pages/service/service' },
        { id: 'settings', name: '设置', icon: '/assets/icons/icon-settings.png', path: '/pages/settings/settings' }
      ]
    ]
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.setData({
        isLogin: true,
        userInfo,
        isVip: userInfo.isVip || false,
        vipExpireTime: userInfo.vipExpireTime || '',
        stats: {
          courseCount: userInfo.courseCount || 0,
          favoriteCount: userInfo.favoriteCount || 0,
          points: userInfo.points || 0,
          balance: userInfo.balance || 0
        }
      });
    } else {
      this.setData({
        isLogin: false,
        userInfo: null
      });
    }
  },

  // 去登录
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  // 编辑资料
  editProfile() {
    wx.navigateTo({ url: '/pages/profile/editProfile/editProfile' });
  },

  // 刷新用户信息
  async refreshUserInfo() {
    try {
      const result = await userApi.getUserInfo();
      this.setData({
        userInfo: result,
        isVip: result.isVip,
        stats: {
          courseCount: result.courseCount || 0,
          favoriteCount: result.favoriteCount || 0,
          points: result.points || 0,
          balance: result.balance || 0
        }
      });
      wx.setStorageSync('userInfo', result);
    } catch (err) {
      console.error('获取用户信息失败', err);
    }
  },

  // 跳转到功能页面
  goToPage(e) {
    const { path } = e.currentTarget.dataset;

    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    wx.navigateTo({ url: path });
  },

  // 成为VIP
  becomeVip() {
    wx.navigateTo({ url: '/pages/vip/vip' });
  },

  // 充值余额
  recharge() {
    wx.navigateTo({ url: '/pages/recharge/recharge' });
  }
});
