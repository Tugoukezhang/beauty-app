/**
 * 会员中心页面
 * 功能：展示会员权益、会员状态、开通/续费入口
 */

Page({
  data: {
    // 用户信息
    userInfo: null,
    isVip: false,
    vipExpireTime: '',
    vipLevel: 1,
    
    // 会员等级
    vipLevels: [
      { level: 1, name: '普通会员', icon: '/assets/icons/vip-1.png', color: '#CD7F32' },
      { level: 2, name: '银卡会员', icon: '/assets/icons/vip-2.png', color: '#C0C0C0' },
      { level: 3, name: '金卡会员', icon: '/assets/icons/vip-3.png', color: '#FFD700' },
      { level: 4, name: '钻石会员', icon: '/assets/icons/vip-4.png', color: '#00CED1' }
    ],
    
    // 会员权益
    benefits: [
      {
        icon: '/assets/icons/benefit-course.png',
        title: '全站课程免费',
        desc: '所有付费课程免费观看'
      },
      {
        icon: '/assets/icons/benefit-ad.png',
        title: '免广告打扰',
        desc: '享受纯净学习体验'
      },
      {
        icon: '/assets/icons/benefit-service.png',
        title: '专属客服',
        desc: '7x24小时优先响应'
      },
      {
        icon: '/assets/icons/benefit-download.png',
        title: '离线下载',
        desc: '课程视频随时缓存'
      },
      {
        icon: '/assets/icons/benefit-avatar.png',
        title: '专属头像框',
        desc: '彰显尊贵身份'
      },
      {
        icon: '/assets/icons/benefit-gift.png',
        title: '生日礼包',
        desc: '会员专属生日福利'
      },
      {
        icon: '/assets/icons/benefit-new.png',
        title: '新功能优先',
        desc: '抢先体验最新功能'
      },
      {
        icon: '/assets/icons/benefit-discount.png',
        title: '专属折扣',
        desc: '周边商品会员价'
      }
    ],
    
    // 会员套餐
    packages: [
      { 
        id: 1, 
        name: '月度会员', 
        duration: 1, 
        unit: '月',
        price: 30, 
        originalPrice: 30,
        dailyPrice: '1.00',
        tag: '灵活选择',
        popular: false
      },
      { 
        id: 2, 
        name: '季度会员', 
        duration: 3, 
        unit: '月',
        price: 78, 
        originalPrice: 90,
        dailyPrice: '0.87',
        tag: '热销推荐',
        popular: true
      },
      { 
        id: 3, 
        name: '年度会员', 
        duration: 12, 
        unit: '月',
        price: 198, 
        originalPrice: 360,
        dailyPrice: '0.54',
        tag: '超值首选',
        popular: false
      }
    ],
    
    // 会员成长值
    growthValue: 0,
    nextLevelNeed: 100,
    growthProgress: 0
  },

  onLoad() {
    this.loadUserInfo();
    this.calculateGrowth();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo,
      isVip: userInfo.isVip || false,
      vipExpireTime: userInfo.vipExpireTime || '',
      vipLevel: userInfo.vipLevel || 1,
      growthValue: userInfo.growthValue || 0
    });
  },

  // 计算成长值进度
  calculateGrowth() {
    const { growthValue, nextLevelNeed } = this.data;
    const progress = Math.min((growthValue / nextLevelNeed) * 100, 100);
    this.setData({ growthProgress: progress });
  },

  // 开通/续费会员
  openVip() {
    wx.navigateTo({
      url: '/pages/recharge/recharge?tab=vip'
    });
  },

  // 查看会员记录
  viewVipRecords() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 分享会员页面
  onShareAppMessage() {
    return {
      title: '加入i妆VIP，解锁全部美妆课程',
      path: '/pages/vip/vip',
      imageUrl: '/assets/images/vip-share.png'
    };
  }
});
