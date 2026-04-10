/**
 * 充值中心页面
 * 功能：妆币充值、会员购买、微信支付
 */

const paymentApi = require('../../api/payment');

Page({
  data: {
    // 当前选中的标签：coin-妆币充值，vip-会员购买
    activeTab: 'coin',
    
    // 用户信息
    userInfo: null,
    currentCoins: 0,
    isVip: false,
    vipExpireTime: '',
    
    // 妆币充值档位
    coinPackages: [
      { id: 1, amount: 6, coins: 60, bonus: 0, tag: '入门', popular: false },
      { id: 2, amount: 30, coins: 330, bonus: 30, tag: '超值', popular: true },
      { id: 3, amount: 98, coins: 1150, bonus: 150, tag: '热销', popular: false },
      { id: 4, amount: 198, coins: 2500, bonus: 500, tag: '豪华', popular: false },
      { id: 5, amount: 328, coins: 4500, bonus: 1200, tag: '尊享', popular: false },
      { id: 6, amount: 648, coins: 10000, bonus: 3500, tag: '至尊', popular: false }
    ],
    selectedCoinPackage: null,
    
    // 会员套餐
    vipPackages: [
      { 
        id: 1, 
        name: '月度会员', 
        duration: 1, 
        unit: '月',
        price: 30, 
        originalPrice: 30,
        tag: '灵活',
        popular: false,
        benefits: ['全站课程免费看', '专属客服', '免广告']
      },
      { 
        id: 2, 
        name: '季度会员', 
        duration: 3, 
        unit: '月',
        price: 78, 
        originalPrice: 90,
        tag: '省钱',
        popular: true,
        benefits: ['全站课程免费看', '专属客服', '免广告', '优先体验新功能']
      },
      { 
        id: 3, 
        name: '年度会员', 
        duration: 12, 
        unit: '月',
        price: 198, 
        originalPrice: 360,
        tag: '最值',
        popular: false,
        benefits: ['全站课程免费看', '专属客服', '免广告', '优先体验新功能', '专属头像框', '生日礼包']
      }
    ],
    selectedVipPackage: null,
    
    // 支付方式
    paymentMethods: [
      { id: 'wechat', name: '微信支付', icon: '/assets/icons/icon-wechat-pay.png', checked: true }
    ],
    
    // 页面状态
    loading: false,
    agreementChecked: true
  },

  onLoad(options) {
    // 如果传入tab参数，切换到对应标签
    if (options.tab) {
      this.setData({ activeTab: options.tab });
    }
    this.loadUserInfo();
    // 默认选中第一个套餐
    this.setData({
      selectedCoinPackage: this.data.coinPackages[1],
      selectedVipPackage: this.data.vipPackages[1]
    });
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo,
      currentCoins: userInfo.coins || 0,
      isVip: userInfo.isVip || false,
      vipExpireTime: userInfo.vipExpireTime || ''
    });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 选择妆币套餐
  selectCoinPackage(e) {
    const packageId = e.currentTarget.dataset.id;
    const pkg = this.data.coinPackages.find(p => p.id === packageId);
    this.setData({ selectedCoinPackage: pkg });
  },

  // 选择会员套餐
  selectVipPackage(e) {
    const packageId = e.currentTarget.dataset.id;
    const pkg = this.data.vipPackages.find(p => p.id === packageId);
    this.setData({ selectedVipPackage: pkg });
  },

  // 切换协议勾选
  toggleAgreement() {
    this.setData({ agreementChecked: !this.data.agreementChecked });
  },

  // 查看协议
  viewAgreement() {
    wx.navigateTo({ url: '/pages/protocol/protocol' });
  },

  // 立即支付
  async payNow() {
    if (!this.data.agreementChecked) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    const { activeTab, selectedCoinPackage, selectedVipPackage } = this.data;
    
    if (activeTab === 'coin' && !selectedCoinPackage) {
      wx.showToast({ title: '请选择充值金额', icon: 'none' });
      return;
    }
    
    if (activeTab === 'vip' && !selectedVipPackage) {
      wx.showToast({ title: '请选择会员套餐', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      let orderInfo;
      if (activeTab === 'coin') {
        // 创建妆币充值订单
        orderInfo = await paymentApi.createCoinOrder({
          packageId: selectedCoinPackage.id,
          amount: selectedCoinPackage.amount,
          coins: selectedCoinPackage.coins
        });
      } else {
        // 创建会员购买订单
        orderInfo = await paymentApi.createVipOrder({
          packageId: selectedVipPackage.id,
          duration: selectedVipPackage.duration,
          amount: selectedVipPackage.price
        });
      }

      // 调起微信支付
      await this.requestPayment(orderInfo);
      
    } catch (err) {
      console.error('支付失败', err);
      wx.showToast({ title: err.message || '支付失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 调起微信支付
  requestPayment(orderInfo) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        timeStamp: orderInfo.timeStamp,
        nonceStr: orderInfo.nonceStr,
        package: orderInfo.package,
        signType: orderInfo.signType || 'RSA',
        paySign: orderInfo.paySign,
        success: (res) => {
          console.log('支付成功', res);
          // 支付成功，查询订单状态
          this.checkOrderStatus(orderInfo.orderId);
          resolve(res);
        },
        fail: (err) => {
          console.error('支付失败', err);
          // 跳转到支付结果页
          wx.navigateTo({
            url: `/pages/payment/result/result?status=fail&orderId=${orderInfo.orderId}`
          });
          reject(err);
        }
      });
    });
  },

  // 查询订单状态
  async checkOrderStatus(orderId) {
    try {
      const result = await paymentApi.queryOrderStatus(orderId);
      if (result.status === 'success') {
        // 更新本地用户信息
        const userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.coins = result.coins;
        userInfo.isVip = result.isVip;
        userInfo.vipExpireTime = result.vipExpireTime;
        wx.setStorageSync('userInfo', userInfo);
        
        // 跳转到支付成功页
        wx.navigateTo({
          url: `/pages/payment/result/result?status=success&orderId=${orderId}&type=${this.data.activeTab}`
        });
      }
    } catch (err) {
      console.error('查询订单状态失败', err);
    }
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
