/**
 * 收藏页面 - 我的收藏
 * 功能：课程收藏、帖子收藏、取消收藏
 */

const userApi = require('../../api/user');

Page({
  data: {
    activeTab: 'course', // 'course' | 'post'
    courseList: [],
    postList: [],
    loading: false,
    empty: false
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  onPullDownRefresh() {
    this.loadFavorites();
    wx.stopPullDownRefresh();
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 加载收藏列表
  async loadFavorites() {
    this.setData({ loading: true });

    try {
      const { activeTab } = this.data;

      if (activeTab === 'course') {
        const result = await userApi.getCourseFavorites();
        this.setData({
          courseList: result.list || [],
          empty: !result.list?.length
        });
      } else {
        const result = await userApi.getPostFavorites();
        this.setData({
          postList: result.list || [],
          empty: !result.list?.length
        });
      }
    } catch (err) {
      // 模拟数据
      this.setMockData();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 模拟数据
  setMockData() {
    if (this.data.activeTab === 'course') {
      this.setData({
        courseList: [
          {
            id: 1,
            title: '新娘妆入门教程',
            cover: 'https://picsum.photos/300/200?random=course1',
            teacher: '美妆导师Lily',
            price: 299,
            originalPrice: 599,
            studyCount: 12580,
            duration: '12课时'
          },
          {
            id: 2,
            title: '古风妆容设计',
            cover: 'https://picsum.photos/300/200?random=course2',
            teacher: '古风化妆师小雪',
            price: 199,
            originalPrice: 399,
            studyCount: 8932,
            duration: '8课时'
          }
        ],
        empty: false
      });
    } else {
      this.setData({
        postList: [
          {
            id: 1,
            content: '今日妆容分享，新买的眼影盘太美了！',
            images: ['/assets/images/post-1.png'],
            author: { nickname: '美妆达人', avatar: '/assets/images/avatar-1.png' },
            likes: 328,
            comments: 56
          }
        ],
        empty: false
      });
    }
  },

  // 取消收藏
  async cancelFavorite(e) {
    const { id, type } = e.currentTarget.dataset;

    try {
      await userApi.cancelFavorite({ id, type });
      wx.showToast({ title: '已取消收藏', icon: 'success' });
      this.loadFavorites();
    } catch (err) {
      wx.showToast({ title: '取消失败', icon: 'none' });
    }
  },

  // 跳转到课程详情
  goToCourse(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/courseDetail/courseDetail?id=${id}` });
  },

  // 跳转到帖子详情
  goToPost(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/community/postDetail/postDetail?id=${id}` });
  }
});
