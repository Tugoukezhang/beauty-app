/**
 * 课程分类页面
 * 功能：分类列表、筛选排序、免费课程优先
 */

const courseApi = require('../../api/course');

Page({
  data: {
    // 左侧分类
    categories: [],
    activeCategoryId: 0,
    
    // 筛选条件
    mainFilters: [
      { id: 'default', name: '综合' },
      { id: 'hot', name: '最热' },
      { id: 'new', name: '最新' }
    ],
    sortBy: 'default',
    priceOrder: null, // 'asc' 或 'desc'
    
    // 免费优先
    showFreeFirst: true,
    
    // 课程列表
    courses: [],
    
    // 加载状态
    loading: false
  },

  onLoad() {
    this.loadCategories();
  },

  onShow() {},

  onPullDownRefresh() {
    this.loadCategories();
    wx.stopPullDownRefresh();
  },

  // 加载分类数据
  async loadCategories() {
    this.setData({ loading: true });

    try {
      const result = await courseApi.getCourseCategories();
      const categories = result.list || this.getMockCategories();

      this.setData({
        categories,
        activeCategoryId: categories[0]?.id || 1
      });

      this.loadCourses();
    } catch (err) {
      this.setMockData();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 获取模拟分类
  getMockCategories() {
    return [
      { id: 1, name: '新娘妆', count: 128 },
      { id: 2, name: '古风妆', count: 96 },
      { id: 3, name: '日常妆', count: 256 },
      { id: 4, name: '宴会妆', count: 84 },
      { id: 5, name: 'Cosplay', count: 72 },
      { id: 6, name: '影视特效', count: 48 },
      { id: 7, name: '美甲', count: 156 },
      { id: 8, name: '护肤', count: 189 }
    ];
  },

  // 设置模拟数据
  setMockData() {
    this.setData({
      categories: this.getMockCategories(),
      courses: this.getMockCourses()
    });
  },

  // 获取模拟课程数据
  getMockCourses() {
    const allCourses = [
      // 新娘妆分类
      {
        id: 101,
        categoryId: 1,
        title: '新娘妆入门必修课',
        cover: 'https://picsum.photos/300/200?random=course1',
        teacher: '美妆导师Lily',
        price: 299,
        originalPrice: 599,
        studyCount: 12580,
        rating: 4.9,
        isFree: false,
        createTime: '2024-03-01'
      },
      {
        id: 102,
        categoryId: 1,
        title: '新娘跟妆全攻略',
        cover: 'https://picsum.photos/300/200?random=course2',
        teacher: '资深化妆师Amy',
        price: 0,
        originalPrice: 0,
        studyCount: 25680,
        rating: 4.8,
        isFree: true,
        createTime: '2024-02-15'
      },
      {
        id: 103,
        categoryId: 1,
        title: '韩式新娘妆教程',
        cover: 'https://picsum.photos/300/200?random=course3',
        teacher: '韩妆大师小雪',
        price: 199,
        originalPrice: 399,
        studyCount: 8932,
        rating: 4.7,
        isFree: false,
        createTime: '2024-02-20'
      },
      {
        id: 104,
        categoryId: 1,
        title: '中式传统新娘造型',
        cover: 'https://picsum.photos/300/200?random=course4',
        teacher: '传统化妆师老王',
        price: 0,
        originalPrice: 0,
        studyCount: 15600,
        rating: 4.9,
        isFree: true,
        createTime: '2024-01-10'
      },
      // 古风妆分类
      {
        id: 201,
        categoryId: 2,
        title: '古风妆容设计基础',
        cover: 'https://picsum.photos/300/200?random=course5',
        teacher: '古风化妆师小雪',
        price: 0,
        originalPrice: 0,
        studyCount: 18900,
        rating: 4.8,
        isFree: true,
        createTime: '2024-03-05'
      },
      {
        id: 202,
        categoryId: 2,
        title: '汉服妆造进阶课程',
        cover: 'https://picsum.photos/300/200?random=course6',
        teacher: '汉服文化导师',
        price: 399,
        originalPrice: 799,
        studyCount: 5620,
        rating: 4.6,
        isFree: false,
        createTime: '2024-02-28'
      },
      // 日常妆分类
      {
        id: 301,
        categoryId: 3,
        title: '日常通勤妆容技巧',
        cover: 'https://picsum.photos/300/200?random=course7',
        teacher: '美妆博主Amy',
        price: 0,
        originalPrice: 0,
        studyCount: 35680,
        rating: 4.7,
        isFree: true,
        createTime: '2024-03-10'
      },
      {
        id: 302,
        categoryId: 3,
        title: '职场女性妆容提升',
        cover: 'https://picsum.photos/300/200?random=course8',
        teacher: '形象设计师Linda',
        price: 129,
        originalPrice: 259,
        studyCount: 7890,
        rating: 4.5,
        isFree: false,
        createTime: '2024-02-25'
      }
    ];
    
    return allCourses;
  },

  // 选择分类
  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.activeCategoryId) return;

    this.setData({
      activeCategoryId: id,
      sortBy: 'default',
      priceOrder: null
    });

    this.loadCourses();
  },

  // 跳转到搜索页
  onSearchTap() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 查看全部
  viewAll() {
    wx.navigateTo({
      url: `/pages/courseList/courseList?categoryId=${this.data.activeCategoryId}`
    });
  },

  // 切换筛选
  onFilterTap(e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.sortBy) return;

    this.setData({ 
      sortBy: id,
      priceOrder: null
    });
    this.loadCourses();
  },

  // 切换价格筛选
  togglePriceFilter() {
    const newOrder = this.data.priceOrder === 'asc' ? 'desc' : 'asc';
    this.setData({ 
      priceOrder: newOrder,
      sortBy: newOrder === 'asc' ? 'price_asc' : 'price_desc'
    });
    this.loadCourses();
  },

  // 加载课程
  async loadCourses() {
    try {
      const result = await courseApi.getCourseList({
        categoryId: this.data.activeCategoryId,
        sortBy: this.data.sortBy
      });
      
      let courses = result.list || [];
      courses = this.processCourses(courses);
      this.setData({ courses });
    } catch (err) {
      let courses = this.getMockCourses().filter(c => 
        c.categoryId === this.data.activeCategoryId
      );
      courses = this.processCourses(courses);
      this.setData({ courses });
    }
  },

  // 处理课程数据（免费优先 + 排序）
  processCourses(courses) {
    if (courses.length === 0) return courses;

    const { sortBy, priceOrder } = this.data;

    // 免费课程优先
    const freeCourses = courses.filter(c => c.isFree);
    const paidCourses = courses.filter(c => !c.isFree);

    // 根据排序条件处理
    let sortedFree = [...freeCourses];
    let sortedPaid = [...paidCourses];

    switch (sortBy) {
      case 'hot':
        sortedFree.sort((a, b) => b.studyCount - a.studyCount);
        sortedPaid.sort((a, b) => b.studyCount - a.studyCount);
        break;
      case 'new':
        sortedFree.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        sortedPaid.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        break;
      case 'price_asc':
      case 'price_desc':
        // 价格排序只在付费课程中排序
        sortedPaid.sort((a, b) => {
          if (sortBy === 'price_asc') {
            return a.price - b.price;
          } else {
            return b.price - a.price;
          }
        });
        break;
      default: // 综合排序
        sortedFree.sort((a, b) => b.rating - a.rating);
        sortedPaid.sort((a, b) => b.rating - a.rating);
    }

    return [...sortedFree, ...sortedPaid];
  },

  // 跳转到课程详情
  goToCourse(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/courseDetail/courseDetail?id=${id}` });
  }
});
