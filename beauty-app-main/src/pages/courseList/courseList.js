/**
 * 课程列表页面
 * 功能：课程瀑布流、筛选排序、空状态
 */

const courseApi = require('../../api/course');

Page({
  data: {
    // 课程列表
    courseList: [],
    // 分类信息
    categoryId: null,
    subCategoryId: null,
    categoryName: '全部课程',
    // 筛选排序
    sortBy: 'default',
    sortOptions: [
      { id: 'default', name: '综合' },
      { id: 'hot', name: '最热' },
      { id: 'new', name: '最新' },
      { id: 'price_asc', name: '价格↑' },
      { id: 'price_desc', name: '价格↓' }
    ],
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
    // 加载状态
    loading: false,
    refreshing: false
  },

  onLoad(options) {
    const { categoryId, subCategoryId, keyword } = options;
    this.setData({
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null,
      categoryName: keyword ? `搜索: ${keyword}` : '全部课程'
    });
    this.loadCourseList();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true, page: 1, hasMore: true });
    this.loadCourseList(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreCourses();
    }
  },

  // 加载课程列表
  async loadCourseList(refresh = false) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { categoryId, subCategoryId, sortBy, page, pageSize } = this.data;
      const result = await courseApi.getCourseList({
        categoryId,
        subCategoryId,
        sortBy,
        page,
        pageSize
      });

      this.setData({
        courseList: refresh ? result.list : [...this.data.courseList, ...result.list],
        hasMore: result.list?.length >= pageSize,
        loading: false,
        refreshing: false
      });
    } catch (err) {
      // 使用模拟数据
      this.setMockData(refresh);
    }
  },

  // 加载更多
  loadMoreCourses() {
    this.setData({ page: this.data.page + 1 });
    this.loadCourseList();
  },

  // 模拟数据
  setMockData(refresh = false) {
    const mockList = [
      {
        id: 101,
        title: '新娘妆入门必修课：从零基础到专业',
        cover: '/assets/images/course-cover-1.png',
        teacher: { name: '美妆导师Lily', avatar: '/assets/images/avatar-lily.png' },
        price: 299,
        originalPrice: 599,
        studyCount: 12580,
        rating: 4.9,
        chapterCount: 12,
        isFree: false,
        isVip: false
      },
      {
        id: 102,
        title: '古风妆容设计教程：唐妆汉服清宫妆',
        cover: '/assets/images/course-cover-2.png',
        teacher: { name: '古风化妆师小雪', avatar: '/assets/images/avatar-xue.png' },
        price: 199,
        originalPrice: 399,
        studyCount: 8932,
        rating: 4.8,
        chapterCount: 8,
        isFree: false,
        isVip: false
      },
      {
        id: 103,
        title: '日常通勤妆容技巧：5分钟快速出门妆',
        cover: 'https://picsum.photos/300/200?random=course3',
        teacher: { name: '美妆博主Amy', avatar: '/assets/images/avatar-amy.png' },
        price: 0,
        originalPrice: 0,
        studyCount: 25680,
        rating: 4.7,
        chapterCount: 6,
        isFree: true,
        isVip: false
      },
      {
        id: 104,
        title: '韩式新娘妆：自然清透的浪漫风格',
        cover: '/assets/images/course-cover-4.png',
        teacher: { name: '韩式美妆师秀贤', avatar: '/assets/images/avatar-soo.png' },
        price: 399,
        originalPrice: 799,
        studyCount: 6580,
        rating: 4.9,
        chapterCount: 10,
        isFree: false,
        isVip: true
      },
      {
        id: 105,
        title: 'Cosplay仿妆：日漫角色还原教程',
        cover: '/assets/images/course-cover-5.png',
        teacher: { name: 'Cos化妆师阿杰', avatar: '/assets/images/avatar-jie.png' },
        price: 159,
        originalPrice: 299,
        studyCount: 4560,
        rating: 4.6,
        chapterCount: 8,
        isFree: false,
        isVip: false
      },
      {
        id: 106,
        title: '影视特效化妆：伤效老年妆入门',
        cover: '/assets/images/course-cover-6.png',
        teacher: { name: '特效化妆师老陈', avatar: '/assets/images/avatar-chen.png' },
        price: 499,
        originalPrice: 999,
        studyCount: 3240,
        rating: 4.8,
        chapterCount: 15,
        isFree: false,
        isVip: true
      }
    ];

    this.setData({
      courseList: refresh ? mockList : [...this.data.courseList, ...mockList],
      hasMore: false,
      loading: false,
      refreshing: false
    });
  },

  // 切换排序
  onSortChange(e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.sortBy) return;

    this.setData({
      sortBy: id,
      page: 1,
      hasMore: true,
      courseList: []
    });
    this.loadCourseList(true);
  },

  // 跳转到课程详情
  goToCourse(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/courseDetail/courseDetail?id=${id}` });
  }
});
