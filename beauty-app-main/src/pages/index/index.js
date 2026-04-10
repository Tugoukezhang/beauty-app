/**
 * 首页
 * @description 首页逻辑处理
 */

const app = getApp();
const { formatPrice, navigateTo } = require('../../utils/index');
const { getCourseList, getHotCourses, getNewCourses, getRecommendCourses } = require('../../api/course');
const { getCourseCategories } = require('../../api/course');
const { getPostList, getHotTopics } = require('../../api/community');

Page({
  data: {
    // 轮播图
    banners: [
      { id: 1, image: 'https://picsum.photos/750/420?random=1', link: '' },
      { id: 2, image: 'https://picsum.photos/750/420?random=2', link: '' },
      { id: 3, image: 'https://picsum.photos/750/420?random=3', link: '' }
    ],
    // 分类
    categories: [],
    // 热门课程
    hotCourses: [],
    // 推荐课程
    recommendCourses: [],
    // 热门帖子
    hotPosts: [],
    // 热门话题
    hotTopics: [],
    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    // 处理分享参数
    if (options.scene) {
      // 通过二维码扫码进入
      const scene = decodeURIComponent(options.scene);
      console.log('扫码参数:', scene);
    }
    
    this.initData();
  },

  onShow() {
    // 检查登录状态
    if (app.globalData.isLogin) {
      this.refreshUserInfo();
    }
  },

  onPullDownRefresh() {
    this.initData();
  },

  /**
   * 初始化数据
   */
  async initData() {
    wx.showLoading({ title: '加载中...' });
    
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadBanners(),
        this.loadHotCourses(),
        this.loadRecommendCourses(),
        this.loadHotPosts()
      ]);
    } catch (err) {
      console.error('初始化数据失败:', err);
    } finally {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 加载分类
   */
  async loadCategories() {
    try {
      // TODO: 替换为真实API
      // const data = await getCourseCategories();
      const mockData = [
        { id: 1, name: '新娘妆', icon: 'https://picsum.photos/80/80?random=bride' },
        { id: 2, name: '古风妆', icon: 'https://picsum.photos/80/80?random=ancient' },
        { id: 3, name: 'Cosplay', icon: 'https://picsum.photos/80/80?random=cos' },
        { id: 4, name: '日常妆', icon: 'https://picsum.photos/80/80?random=daily' },
        { id: 5, name: '影视特效', icon: 'https://picsum.photos/80/80?random=film' },
        { id: 6, name: '进阶课程', icon: 'https://picsum.photos/80/80?random=advanced' }
      ];
      this.setData({ categories: mockData });
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  },

  /**
   * 加载轮播图
   */
  async loadBanners() {
    // TODO: 替换为真实API
    // 默认使用占位图
    const defaultBanners = [
      { id: 1, image: 'https://picsum.photos/750/400?random=1', link: '' },
      { id: 2, image: 'https://picsum.photos/750/400?random=2', link: '' },
      { id: 3, image: 'https://picsum.photos/750/400?random=3', link: '' }
    ];
    this.setData({ banners: defaultBanners });
  },

  /**
   * 加载热门课程
   */
  async loadHotCourses() {
    try {
      // TODO: 替换为真实API
      // const data = await getHotCourses(6);
      const mockData = this.generateMockCourses(6);
      this.setData({ hotCourses: mockData });
    } catch (err) {
      console.error('加载热门课程失败:', err);
    }
  },

  /**
   * 加载推荐课程
   */
  async loadRecommendCourses() {
    try {
      // TODO: 替换为真实API
      // const data = await getRecommendCourses(0, 6);
      const mockData = this.generateMockCourses(6);
      this.setData({ recommendCourses: mockData });
    } catch (err) {
      console.error('加载推荐课程失败:', err);
    }
  },

  /**
   * 加载热门帖子
   */
  async loadHotPosts() {
    try {
      // TODO: 替换为真实API
      // const data = await getPostList({ sort: 'hot', pageSize: 3 });
      const mockData = this.generateMockPosts(3);
      this.setData({ hotPosts: mockData });
    } catch (err) {
      console.error('加载热门帖子失败:', err);
    }
  },

  /**
   * 生成模拟课程数据
   */
  generateMockCourses(count) {
    const courses = [];
    for (let i = 0; i < count; i++) {
      courses.push({
        id: i + 1,
        title: ['新娘妆入门教程', '古风妆容技法', '日常通勤妆容', 'Cosplay仿妆技巧', '影视特效化妆'][i % 5],
        cover: `https://picsum.photos/300/200?random=${10 + i}`,
        price: [99, 198, 68, 128, 258][i % 5],
        teacherName: ['小林老师', '美妆达人小雅', '化妆师阿美', '特效化妆师老王', '国风化妆师云裳'][i % 5],
        teacherAvatar: `https://picsum.photos/50/50?random=${20 + i}`,
        studentCount: Math.floor(Math.random() * 10000)
      });
    }
    return courses;
  },

  /**
   * 生成模拟帖子数据
   */
  generateMockPosts(count) {
    const posts = [];
    for (let i = 0; i < count; i++) {
      posts.push({
        id: i + 1,
        coverImage: `https://picsum.photos/400/300?random=${30 + i}`,
        content: ['分享一款超好看的日常妆容，简单易学！', '新手必看！新娘妆详细步骤教程', '古风造型搭配技巧分享'][i % 3],
        userAvatar: `https://picsum.photos/50/50?random=${40 + i}`,
        userName: ['美妆达人', '化妆师小王', '备婚新娘'][i % 3],
        likeCount: Math.floor(Math.random() * 1000),
        commentCount: Math.floor(Math.random() * 100)
      });
    }
    return posts;
  },

  /**
   * 刷新用户信息
   */
  refreshUserInfo() {
    // TODO: 调用API刷新用户信息
  },

  /**
   * 搜索点击
   */
  onSearchTap() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  /**
   * 分类点击
   */
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/courseList/courseList?categoryId=${id}`
    });
  },

  /**
   * 进入课程详情
   */
  goToCourseDetail(e) {
    const { id } = e.currentTarget.dataset;
    navigateTo('/pages/courseDetail/courseDetail', { id });
  },

  /**
   * 进入课程列表
   */
  goToCourseList() {
    wx.switchTab({
      url: '/pages/category/category'
    });
  },

  /**
   * 进入帖子详情
   */
  goToPostDetail(e) {
    const { id } = e.currentTarget.dataset;
    // TODO: 跳转到帖子详情页
    console.log('进入帖子详情', id);
  },

  /**
   * 切换到社区
   */
  switchToCommunity() {
    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  /**
   * 加载更多
   */
  async onLoadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    try {
      const { page, pageSize } = this.data;
      const nextPage = page + 1;
      // TODO: 调用API获取更多推荐课程
      // const data = await getRecommendCourses(0, pageSize, nextPage);
      
      // 模拟数据
      const newData = this.generateMockCourses(6);
      
      if (newData.length < pageSize) {
        this.setData({ hasMore: false });
      } else {
        this.setData({
          recommendCourses: [...this.data.recommendCourses, ...newData],
          page: nextPage
        });
      }
    } catch (err) {
      console.error('加载更多失败:', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  onShareAppMessage() {
    return {
      title: 'i妆 - 专业美妆教学平台',
      path: '/pages/index/index',
      imageUrl: '/src/assets/images/share.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: 'i妆 - 专业美妆教学平台',
      query: 'from=timeline'
    };
  }
});
