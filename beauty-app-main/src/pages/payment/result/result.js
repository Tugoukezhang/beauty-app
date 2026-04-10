/**
 * 支付结果页面
 * 功能：展示支付成功/失败状态
 */

Page({
  data: {
    // 支付状态：success, fail
    status: 'success',
    // 订单类型：coin-妆币充值，vip-会员购买
    type: 'coin',
    orderId: '',
    
    // 支付详情
    amount: 0,
    coins: 0,
    vipDuration: '',
    
    // 倒计时
    countdown: 5,
    timer: null
  },

  onLoad(options) {
    const status = options.status || 'success';
    const type = options.type || 'coin';
    const orderId = options.orderId || '';
    
    this.setData({
      status,
      type,
      orderId
    });
    
    // 加载订单详情
    this.loadOrderDetail(orderId);
    
    // 支付成功时开始倒计时
    if (status === 'success') {
      this.startCountdown();
    }
  },

  onUnload() {
    // 清除定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 加载订单详情
  loadOrderDetail(orderId) {
    // 实际项目中从服务器获取
    // 这里模拟数据
    if (this.data.type === 'coin') {
      this.setData({
        amount: 30,
        coins: 330
      });
    } else {
      this.setData({
        amount: 78,
        vipDuration: '3个月'
      });
    }
  },

  // 开始倒计时
  startCountdown() {
    const timer = setInterval(() => {
      let { countdown } = this.data;
      if (countdown > 1) {
        this.setData({ countdown: countdown - 1 });
      } else {
        clearInterval(timer);
        this.goBack();
      }
    }, 1000);
    
    this.setData({ timer });
  },

  // 返回首页
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({ delta: 2 });
  },

  // 查看订单
  viewOrder() {
    wx.showToast({
      title: '订单详情开发中',
      icon: 'none'
    });
  },

  // 重新支付
  repay() {
    wx.navigateBack({ delta: 1 });
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服微信：izhuang_service\n工作时间：9:00-21:00',
      showCancel: false
    });
  }
});
