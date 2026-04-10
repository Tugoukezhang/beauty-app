/**
 * i妆 - 首页（沉浸式化妆台 - 精简版）
 * 只有：人物 + 化妆台 + 入口
 * 推荐课程在"课程"Tab，热门动态在"社区"Tab
 */

const app = getApp();

Page({
  data: {
    hasNewMessage: false,
    dailyQuote: {},
    showDailyTask: true,

    // 虚拟形象配置（后续接入换装系统）
    avatar: {
      hairStyle: '',        // '' | 'long' | 'twintail' | 'bob' | 'curly' | 'bun'
      accessory: '',        // '' | 'bow' | 'crown' | 'flower' | 'stars' | 'ribbon'
      dressStyle: '',       // '' | 'princess' | 'ancient' | 'cos' | 'elegant' | 'wedding'
      handItem: '',         // '' | 'lipstick' | 'brush' | 'perfume' | 'mirror' | 'rose'
      skinTone: 'light',    // 'fair' | 'light' | 'medium' | 'tan' | 'cool'
    },
  },

  onLoad(options) {
    if (options.scene) {
      const scene = decodeURIComponent(options.scene);
      console.log('扫码参数:', scene);
    }
    this.initData();
  },

  onShow() {
    this.checkDailyTask();
    this.loadAvatar();
  },

  onPullDownRefresh() {
    this.initData();
    wx.stopPullDownRefresh();
  },

  initData() {
    this.setDailyQuote();
  },

  /**
   * 加载用户形象配置
   */
  loadAvatar() {
    const avatarConfig = wx.getStorageSync('avatarConfig');
    if (avatarConfig) {
      this.setData({ avatar: avatarConfig });
    }
  },

  /**
   * 设置每日一句
   */
  setDailyQuote() {
    const quotes = [
      { text: '美丽不是天赋，是每一天的精心雕琢' },
      { text: '化妆不是为了取悦别人，而是遇见更好的自己' },
      { text: '每一笔都是对自己的温柔' },
      { text: '从素颜到精致，你只需要一点勇气' },
      { text: '化妆是魔法，让你成为自己的公主' },
      { text: '今天也要做个闪闪发光的女孩' },
      { text: '你的妆容，就是你的态度' },
    ];
    const dayIndex = new Date().getDate() % quotes.length;
    this.setData({ dailyQuote: quotes[dayIndex] });
  },

  /**
   * 检查每日任务
   */
  checkDailyTask() {
    const todayStr = new Date().toDateString();
    const taskDone = wx.getStorageSync('dailyTaskDone_' + todayStr);
    this.setData({ showDailyTask: !taskDone });
  },

  // ======== 导航方法 ========

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  goToMessages() {
    wx.showToast({ title: '消息功能开发中', icon: 'none' });
  },

  /** "我的"页面 - 从顶部进入 */
  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  /** 平板 - 视频教程/直播 */
  goToTablet() {
    wx.showToast({ title: '平板功能开发中', icon: 'none' });
  },

  /** 化妆盒 - 化妆品管理 */
  goToMakeupBox() {
    wx.showToast({ title: '化妆盒功能开发中', icon: 'none' });
  },

  /** 镜子 - 补光镜/相机 */
  goToMirror() {
    wx.showToast({ title: '镜子功能开发中', icon: 'none' });
  },

  goToThemeMakeup() {
    wx.switchTab({ url: '/pages/category/category' });
  },

  goToCourseList() {
    wx.switchTab({ url: '/pages/category/category' });
  },

  goToCommunity() {
    wx.switchTab({ url: '/pages/community/community' });
  },

  goToShop() {
    wx.switchTab({ url: '/pages/recommend/recommend' });
  },

  goToTask() {
    wx.navigateTo({ url: '/pages/task/task' });
  },

  /** 进入换装页面 */
  goToAvatarCustomize() {
    wx.navigateTo({ url: '/pages/avatar/avatar' });
  },

  // ======== 分享 ========

  onShareAppMessage() {
    return {
      title: 'i妆 - 专业美妆教学平台',
      path: '/pages/index/index',
    };
  },

  onShareTimeline() {
    return {
      title: 'i妆 - 专业美妆教学平台',
      query: 'from=timeline',
    };
  }
});
