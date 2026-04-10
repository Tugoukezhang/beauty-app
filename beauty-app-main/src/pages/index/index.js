/**
 * i妆 - 首页（场景化化妆台）
 * 核心功能：沉浸式化妆台场景 + 精准入口 + 个性化推荐
 */

const app = getApp();

Page({
  data: {
    // 消息提示
    hasNewMessage: false,
    // 每日一句
    dailyQuote: {},
    // 每日任务
    showDailyTask: true,
    // 推荐课程
    recommendCourses: [],
    // 热门帖子
    hotPosts: [],
  },

  onLoad(options) {
    // 处理分享参数
    if (options.scene) {
      const scene = decodeURIComponent(options.scene);
      console.log('扫码参数:', scene);
    }

    this.initData();
  },

  onShow() {
    // 检查是否需要显示每日任务
    this.checkDailyTask();
  },

  onPullDownRefresh() {
    this.initData();
  },

  /**
   * 初始化数据
   */
  async initData() {
    this.setDailyQuote();
    this.loadRecommendCourses();
    this.loadHotPosts();
  },

  /**
   * 设置每日一句
   */
  setDailyQuote() {
    const quotes = [
      { text: '美丽不是天赋，是每一天的精心雕琢', author: 'i妆' },
      { text: '化妆不是为了取悦别人，而是遇见更好的自己', author: 'i妆' },
      { text: '每一笔都是对自己的温柔', author: 'i妆' },
      { text: '从素颜到精致，你只需要一点勇气', author: 'i妆' },
      { text: '化妆是魔法，让你成为自己的公主', author: 'i妆' },
      { text: '今天也要做个闪闪发光的女孩', author: 'i妆' },
      { text: '你的妆容，就是你的态度', author: 'i妆' },
    ];
    const dayIndex = new Date().getDate() % quotes.length;
    this.setData({ dailyQuote: quotes[dayIndex] });
  },

  /**
   * 检查每日任务
   */
  checkDailyTask() {
    // 如果今日已完成任务则不显示
    const todayStr = new Date().toDateString();
    const taskDone = wx.getStorageSync('dailyTaskDone_' + todayStr);
    this.setData({ showDailyTask: !taskDone });
  },

  /**
   * 加载推荐课程
   */
  loadRecommendCourses() {
    // 优先使用用户偏好推荐
    const preferences = wx.getStorageSync('userPreferences');
    let courses = [];

    if (preferences && preferences.directions) {
      courses = this.getPersonalizedCourses(preferences);
    } else {
      courses = this.getDefaultCourses();
    }

    this.setData({ recommendCourses: courses });
  },

  /**
   * 根据偏好推荐课程
   */
  getPersonalizedCourses(preferences) {
    const courseMap = {
      bride: [
        { id: 'b1', title: '新娘妆全流程教学', emoji: '👰', level: '初级', lessons: 12, price: 0, isFree: true, studentCount: 8234 },
        { id: 'b2', title: '敬酒服造型速成', emoji: '🥂', level: '中级', lessons: 8, price: 29, isFree: false, studentCount: 4521 },
      ],
      daily: [
        { id: 'd1', title: '5分钟通勤妆', emoji: '🌸', level: '初级', lessons: 6, price: 0, isFree: true, studentCount: 12560 },
        { id: 'd2', title: '约会心机妆', emoji: '💕', level: '中级', lessons: 10, price: 19, isFree: false, studentCount: 6789 },
      ],
      ancient: [
        { id: 'a1', title: '古风底妆与眉形', emoji: '🏮', level: '初级', lessons: 8, price: 0, isFree: true, studentCount: 5621 },
        { id: 'a2', title: '汉服造型进阶', emoji: '👘', level: '中级', lessons: 12, price: 39, isFree: false, studentCount: 3210 },
      ],
      cos: [
        { id: 'c1', title: 'Cos妆入门基础', emoji: '🎭', level: '初级', lessons: 10, price: 0, isFree: true, studentCount: 7890 },
        { id: 'c2', title: '角色还原进阶', emoji: '⚔️', level: '中级', lessons: 8, price: 29, isFree: false, studentCount: 4321 },
      ],
      film: [
        { id: 'f1', title: '特效化妆入门', emoji: '🎬', level: '中级', lessons: 14, price: 49, isFree: false, studentCount: 2345 },
      ],
      party: [
        { id: 'p1', title: '派对闪亮妆容', emoji: '🎉', level: '初级', lessons: 6, price: 0, isFree: true, studentCount: 6543 },
      ],
    };

    let result = [];
    preferences.directions.forEach(dir => {
      if (courseMap[dir]) result.push(...courseMap[dir]);
    });

    // 加上肤质课程
    const skinCourseMap = {
      dry: { id: 's1', title: '干皮底妆不卡粉秘籍', emoji: '💧', level: '初级', lessons: 4, price: 0, isFree: true, studentCount: 9876 },
      oily: { id: 's2', title: '油皮持妆12小时', emoji: '✨', level: '初级', lessons: 4, price: 0, isFree: true, studentCount: 8765 },
      sensitive: { id: 's3', title: '敏感肌化妆安全指南', emoji: '🌸', level: '初级', lessons: 4, price: 0, isFree: true, studentCount: 7654 },
      combo: { id: 's4', title: '混合皮分区上妆法', emoji: '🔄', level: '初级', lessons: 4, price: 0, isFree: true, studentCount: 6543 },
    };

    if (preferences.skinType && skinCourseMap[preferences.skinType]) {
      result.unshift(skinCourseMap[preferences.skinType]);
    }

    return result.slice(0, 6);
  },

  /**
   * 默认推荐课程（无偏好时）
   */
  getDefaultCourses() {
    return [
      { id: 1, title: '5分钟通勤妆', emoji: '🌸', level: '初级', lessons: 6, price: 0, isFree: true, studentCount: 12560 },
      { id: 2, title: '新娘妆全流程教学', emoji: '👰', level: '初级', lessons: 12, price: 0, isFree: true, studentCount: 8234 },
      { id: 3, title: '古风底妆与眉形', emoji: '🏮', level: '初级', lessons: 8, price: 0, isFree: true, studentCount: 5621 },
      { id: 4, title: 'Cos妆入门基础', emoji: '🎭', level: '初级', lessons: 10, price: 0, isFree: true, studentCount: 7890 },
      { id: 5, title: '约会心机妆', emoji: '💕', level: '中级', lessons: 10, price: 19, isFree: false, studentCount: 6789 },
      { id: 6, title: '派对闪亮妆容', emoji: '🎉', level: '初级', lessons: 6, price: 0, isFree: true, studentCount: 6543 },
    ];
  },

  /**
   * 加载热门帖子
   */
  loadHotPosts() {
    const mockPosts = [
      {
        id: 1,
        avatarEmoji: '👩‍🎨',
        userName: '美妆达人小雅',
        time: '2小时前',
        content: '分享一款超好看的日常妆容，简单5步就能搞定！特别适合上班族和学生党~',
        tags: ['日常妆', '新手教程'],
        likeCount: 234,
        commentCount: 45,
      },
      {
        id: 2,
        avatarEmoji: '👰',
        userName: '备婚新娘Amy',
        time: '5小时前',
        content: '试妆终于定下来啦！用的是课程里学到的底妆技巧，持妆一整天都不脱妆！',
        tags: ['新娘妆', '备婚日记'],
        likeCount: 567,
        commentCount: 89,
      },
      {
        id: 3,
        avatarEmoji: '🏮',
        userName: '国风少女云裳',
        time: '昨天',
        content: '第一次尝试古风妆，跟着i妆的课程学的，没想到效果这么好！姐妹们快来试试',
        tags: ['古风妆', '汉服'],
        likeCount: 892,
        commentCount: 156,
      },
    ];
    this.setData({ hotPosts: mockPosts });
  },

  // ======== 导航方法 ========

  /** 搜索 */
  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  /** 消息 */
  goToMessages() {
    wx.showToast({ title: '消息功能开发中', icon: 'none' });
  },

  /** 主题妆 */
  goToThemeMakeup() {
    wx.switchTab({ url: '/pages/category/category' });
  },

  /** 课程 */
  goToCourseList() {
    wx.switchTab({ url: '/pages/category/category' });
  },

  /** 玩法（社区） */
  goToCommunity() {
    wx.switchTab({ url: '/pages/community/community' });
  },

  /** 商城 */
  goToShop() {
    wx.showToast({ title: '商城功能开发中', icon: 'none' });
  },

  /** 补光镜 */
  goToMirror() {
    wx.showToast({ title: '补光镜功能开发中', icon: 'none' });
  },

  /** 课程详情 */
  goToCourseDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/courseDetail/courseDetail?id=${id}` });
  },

  /** 帖子详情 */
  goToPostDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/community/postDetail/postDetail?id=${id}` });
  },

  /** 切换到社区 */
  switchToCommunity() {
    wx.switchTab({ url: '/pages/community/community' });
  },

  /** 每日任务 */
  goToTask() {
    wx.navigateTo({ url: '/pages/task/task' });
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
