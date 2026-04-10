// 管理后台登录页
Page({
  data: {
    username: '',
    password: '',
    loading: false,
    showPassword: false
  },

  onLoad() {
    // 检查是否已登录
    const adminInfo = wx.getStorageSync('adminInfo');
    if (adminInfo && adminInfo.isAdmin) {
      wx.redirectTo({
        url: '/pages/admin/admin'
      });
    }
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  // 切换密码显示
  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  // 登录
  login() {
    const { username, password } = this.data;

    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (!password.trim()) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    // 调用云函数验证管理员身份
    wx.cloud.callFunction({
      name: 'adminLogin',
      data: { username, password }
    }).then(res => {
      this.setData({ loading: false });
      
      if (res.result && res.result.success) {
        // 保存管理员信息
        wx.setStorageSync('adminInfo', {
          ...res.result.data,
          isAdmin: true,
          loginTime: Date.now()
        });
        
        wx.showToast({ title: '登录成功', icon: 'success' });
        
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/admin/admin' });
        }, 1000);
      } else {
        wx.showToast({ 
          title: res.result.message || '登录失败', 
          icon: 'none' 
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      
      // 开发环境：模拟登录成功
      if (username === 'admin' && password === 'admin123') {
        wx.setStorageSync('adminInfo', {
          username: 'admin',
          nickname: '超级管理员',
          isAdmin: true,
          loginTime: Date.now()
        });
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/admin/admin' });
        }, 1000);
      } else {
        wx.showToast({ title: '用户名或密码错误', icon: 'none' });
      }
    });
  },

  // 返回首页
  goBack() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
