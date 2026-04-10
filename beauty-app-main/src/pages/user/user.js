// pages/user/user.js
const api = require('../../api/api.js');
const app = getApp();

Page({
  data: {
    userId: null,
    user: {
      nickname: '美妆达人',
      avatar: '',
      bio: '热爱美妆，分享美丽~',
      vipLevel: 1,
      postCount: 12,
      followCount: 86,
      fansCount: 256,
      likesCount: 1280,
      isFollow: false
    },

    // Tab
    tabs: ['笔记', '收藏', '课程'],
    activeTab: 0,

    // 内容列表
    posts: [],
    collections: [],
    courses: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,

    // 是否是当前用户
    isOwner: true,

    // 用户信息
    currentUser: null
  },

  onLoad: function (options) {
    const userId = options.id;
    if (userId) {
      this.setData({
        userId,
        currentUser: app.globalData.userInfo,
        isOwner: userId == app.globalData.userInfo?.id
      });
    } else {
      // 没有id参数时，默认是当前用户的页面
      this.setData({ isOwner: true });
    }

    this.loadUserProfile();
  },

  onShow: function () {
    this.setData({ currentUser: app.globalData.userInfo });
  },

  onTabChange: function (e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index,
      page: 1,
      posts: [],
      collections: [],
      courses: [],
      hasMore: true
    });

    if (index === 0) {
      this.loadPosts();
    } else if (index === 1) {
      this.loadCollections();
    } else {
      this.loadCourses();
    }
  },

  // ========== 加载用户信息 ==========
  loadUserProfile: function () {
    // 模拟数据
    this.setData({
      user: {
        nickname: '美妆达人',
        avatar: '',
        bio: '热爱美妆，分享美丽~',
        vipLevel: 1,
        postCount: 12,
        followCount: 86,
        fansCount: 256,
        likesCount: 1280,
        isFollow: false
      }
    });

    // 加载默认Tab内容
    this.loadPosts();
  },

  // ========== 加载笔记 ==========
  loadPosts: function () {
    // 模拟笔记数据
    this.setData({
      posts: [
        { id: 1, images: [], likes: 128, title: '新娘妆教程' },
        { id: 2, images: [], likes: 86, title: '日常通勤妆' },
        { id: 3, images: [], likes: 234, title: '古风妆分享' },
        { id: 4, images: [], likes: 56, title: '约会妆' }
      ]
    });
  },

  // ========== 加载收藏 ==========
  loadCollections: function () {
    // 模拟收藏数据
    this.setData({
      collections: [
        { id: 1, images: [], likes: 512, title: '收藏1' },
        { id: 2, images: [], likes: 328, title: '收藏2' }
      ]
    });
  },

  // ========== 加载课程 ==========
  loadCourses: function () {
    // 模拟课程数据
    this.setData({
      courses: [
        { id: 1, cover: '', title: '新娘妆全流程', description: '从底妆到定妆，手把手教你打造完美新娘妆', price: 0, studentCount: 2340 },
        { id: 2, cover: '', title: '古风妆容入门', description: '汉服妆造必备技能，轻松变身古风美人', price: 29.9, studentCount: 1560 },
        { id: 3, cover: '', title: '日常快速化妆', description: '10分钟出门妆，上班族必备', price: 0, studentCount: 3890 }
      ]
    });
  },

  onReachBottom: function () {
    if (!this.data.hasMore || this.data.loading) return;
  },

  // ========== 关注/取关 ==========
  handleFollow: function () {
    const user = this.data.user;
    const isFollow = !user.isFollow;

    this.setData({ 'user.isFollow': isFollow });

    wx.showToast({
      title: isFollow ? '关注成功' : '取消关注',
      icon: 'success'
    });
  },

  // ========== 跳转 ==========
  goToPostDetail: function (e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/postDetail/postDetail?id=${postId}`
    });
  },

  goToCourseDetail: function (e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/courseDetail/courseDetail?id=${courseId}`
    });
  },

  goToSettings: function () {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
});
