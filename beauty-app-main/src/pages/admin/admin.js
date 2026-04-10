// 管理后台首页
const app = getApp();

Page({
  data: {
    isLogin: false,
    adminInfo: null,
    menuList: [
      { icon: 'video', name: '课程管理', path: '/pages/admin/courseManage/courseManage', color: '#FF6B9D' },
      { icon: 'user', name: '用户管理', path: '/pages/admin/userManage/userManage', color: '#4ECDC4' },
      { icon: 'cart', name: '订单管理', path: '/pages/admin/orderManage/orderManage', color: '#45B7D1' },
      { icon: 'chart', name: '数据统计', path: '/pages/admin/dataStats/dataStats', color: '#96CEB4' },
      { icon: 'user-list', name: '老师管理', path: '/pages/admin/teacherManage/teacherManage', color: '#FFEAA7' },
      { icon: 'gift', name: '活动管理', path: '/pages/admin/activityManage/activityManage', color: '#DDA0DD' },
      { icon: 'setting', name: '系统设置', path: '/pages/admin/systemSettings/systemSettings', color: '#98D8C8' }
    ],
    todayStats: {
      newUsers: 0,
      newOrders: 0,
      revenue: 0,
      activeUsers: 0
    }
  },

  onLoad() {
    this.checkAdminLogin();
  },

  onShow() {
    if (this.data.isLogin) {
      this.loadTodayStats();
    }
  },

  // 检查管理员登录状态
  checkAdminLogin() {
    const adminInfo = wx.getStorageSync('adminInfo');
    if (adminInfo && adminInfo.isAdmin) {
      this.setData({
        isLogin: true,
        adminInfo: adminInfo
      });
      this.loadTodayStats();
    } else {
      wx.redirectTo({
        url: '/pages/admin/login/login'
      });
    }
  },

  // 加载今日统计数据
  loadTodayStats() {
    // 模拟数据，实际应从云函数获取
    this.setData({
      todayStats: {
        newUsers: 12,
        newOrders: 8,
        revenue: 298,
        activeUsers: 156
      }
    });
  },

  // 菜单点击
  onMenuTap(e) {
    const { path } = e.currentTarget.dataset;
    wx.navigateTo({ url: path });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出管理后台吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminInfo');
          wx.redirectTo({
            url: '/pages/admin/login/login'
          });
        }
      }
    });
  }
});
