/**
 * 课程详情页面
 * 功能：课程介绍、目录、评价、购买/学习
 */

const courseApi = require('../../api/course');
const paymentApi = require('../../api/payment');

Page({
  data: {
    // 课程信息
    courseId: null,
    courseInfo: null,
    teacherInfo: null,
    chapters: [],
    reviews: [],
    relatedCourses: [],
    // 状态
    isPurchased: false,
    isVipUser: false,
    isFavorite: false,
    // Tab
    activeTab: 'intro',
    tabs: [
      { id: 'intro', name: '介绍' },
      { id: 'catalog', name: '目录' },
      { id: 'review', name: '评价' }
    ],
    // 工具清单
    tools: [],
    // 加载状态
    loading: false
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ courseId: parseInt(id) || 1 });
    this.loadCourseDetail();
    this.checkFavoriteStatus();
  },

  onShow() {
    this.checkPurchaseStatus();
  },

  onShareAppMessage() {
    const { courseInfo } = this.data;
    return {
      title: courseInfo?.title || '发现好课',
      path: `/pages/courseDetail/courseDetail?id=${this.data.courseId}`
    };
  },

  // 加载课程详情
  async loadCourseDetail() {
    this.setData({ loading: true });

    try {
      const result = await courseApi.getCourseDetail({ id: this.data.courseId });
      this.setData({
        courseInfo: result.course,
        teacherInfo: result.teacher,
        chapters: result.chapters || [],
        reviews: result.reviews || [],
        relatedCourses: result.relatedCourses || [],
        tools: result.tools || []
      });
    } catch (err) {
      this.setMockData();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 模拟数据
  setMockData() {
    const courseInfo = {
      id: 101,
      title: '新娘妆入门必修课：从零基础到专业',
      cover: 'https://picsum.photos/300/200?random=course1',
      price: 299,
      originalPrice: 599,
      studyCount: 12580,
      rating: 4.9,
      reviewCount: 2380,
      chapterCount: 12,
      duration: '8小时',
      isFree: false,
      isVip: false,
      description: '本课程专为零基础学员设计，从基础理论开始，循序渐进地教授新娘妆的专业技巧。课程涵盖面部护理、底妆、眼妆、唇妆、发型等全方位内容，帮助学员快速掌握新娘妆的核心技能。'
    };

    const teacherInfo = {
      id: 1,
      name: '美妆导师Lily',
      avatar: '/assets/images/avatar-lily.png',
      title: '国家高级化妆师',
      experience: '10年+从业经验',
      students: '50000+学员',
      courses: 28,
      description: '从事美妆教育10余年，培养学员超过5万人，擅长新娘妆、舞台妆等专业领域。'
    };

    const chapters = [
      { id: 1, title: '第一章：新娘妆基础理论', duration: '45分钟', isFree: true },
      { id: 2, title: '第二章：肤质分析与护理', duration: '38分钟', isFree: true },
      { id: 3, title: '第三章：完美底妆技巧', duration: '52分钟', isFree: false },
      { id: 4, title: '第四章：眼妆打造（单眼皮）', duration: '48分钟', isFree: false },
      { id: 5, title: '第五章：眼妆打造（双眼皮）', duration: '45分钟', isFree: false },
      { id: 6, title: '第六章：腮红与修容', duration: '35分钟', isFree: false },
      { id: 7, title: '第七章：精致唇妆', duration: '30分钟', isFree: false },
      { id: 8, title: '第八章：发型基础', duration: '55分钟', isFree: false },
      { id: 9, title: '第九章：中式新娘造型', duration: '60分钟', isFree: false },
      { id: 10, title: '第十章：西式新娘造型', duration: '58分钟', isFree: false },
      { id: 11, title: '第十一章：韩式新娘造型', duration: '62分钟', isFree: false },
      { id: 12, title: '第十二章：整体造型实操', duration: '75分钟', isFree: false }
    ];

    const reviews = [
      { id: 1, user: '小红***', avatar: '/assets/images/avatar-1.png', rating: 5, content: '老师讲得很细致，适合新手入门！', time: '2024-01-15' },
      { id: 2, user: '美妆***', avatar: '/assets/images/avatar-2.png', rating: 5, content: '课程内容很实用，已经接了几单新娘妆了', time: '2024-01-12' },
      { id: 3, user: '化妆***', avatar: '/assets/images/avatar-3.png', rating: 4, content: '不错，学到了很多技巧', time: '2024-01-10' }
    ];

    const tools = [
      { name: '隔离霜', recommend: '滋色隔离霜' },
      { name: '粉底液', recommend: 'MAC定制无暇粉底液' },
      { name: '遮瑕', recommend: 'NARS遮瑕膏' },
      { name: '散粉', recommend: '纪梵希四宫格散粉' },
      { name: '眼影盘', recommend: '完美日记眼影盘' },
      { name: '睫毛膏', recommend: '兰蔻天鹅颈睫毛膏' },
      { name: '腮红', recommend: '3CE腮红' },
      { name: '口红', recommend: '迪奥999' }
    ];

    this.setData({
      courseInfo,
      teacherInfo,
      chapters,
      reviews,
      tools
    });
  },

  // 检查购买状态
  checkPurchaseStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 模拟：已购买或VIP可看
      this.setData({
        isPurchased: userInfo.isVip || false,
        isVipUser: userInfo.isVip || false
      });
    }
  },

  // 检查收藏状态
  async checkFavoriteStatus() {
    try {
      const result = await courseApi.checkFavorite({ courseId: this.data.courseId });
      this.setData({ isFavorite: result.isFavorite });
    } catch (err) {
      this.setData({ isFavorite: false });
    }
  },

  // 切换Tab
  onTabChange(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ activeTab: id });
  },

  // 切换收藏
  async toggleFavorite() {
    const { isFavorite, courseId } = this.data;

    try {
      if (isFavorite) {
        await courseApi.cancelFavorite({ courseId });
      } else {
        await courseApi.addFavorite({ courseId });
      }
      this.setData({ isFavorite: !isFavorite });
      wx.showToast({
        title: isFavorite ? '已取消收藏' : '收藏成功',
        icon: 'success'
      });
    } catch (err) {
      // 模拟操作
      this.setData({ isFavorite: !isFavorite });
      wx.showToast({
        title: this.data.isFavorite ? '收藏成功' : '已取消收藏',
        icon: 'success'
      });
    }
  },

  // 立即购买
  async buyNow() {
    const { courseInfo } = this.data;
    if (!courseInfo) return;

    wx.showModal({
      title: '确认购买',
      content: `确定要购买《${courseInfo.title}》吗？\n价格：¥${courseInfo.price}`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await paymentApi.createOrder({
              courseId: this.data.courseId,
              amount: courseInfo.price
            });
            wx.showToast({ title: '购买成功', icon: 'success' });
            this.setData({ isPurchased: true });
          } catch (err) {
            wx.showToast({ title: '购买失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 开始学习/继续学习
  startLearning() {
    const { chapters, isPurchased } = this.data;
    if (!isPurchased && !chapters[0]?.isFree) {
      wx.showToast({ title: '请先购买课程', icon: 'none' });
      return;
    }

    // 跳转到播放页面
    wx.navigateTo({
      url: `/pages/coursePlay/coursePlay?courseId=${this.data.courseId}&chapterId=${chapters[0]?.id}`
    });
  },

  // 播放试看章节
  playFreeChapter(e) {
    const { chapterId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/coursePlay/coursePlay?courseId=${this.data.courseId}&chapterId=${chapterId}`
    });
  },

  // 跳转到老师主页
  goToTeacher() {
    const { teacherInfo } = this.data;
    wx.navigateTo({
      url: `/pages/teacher/teacher?id=${teacherInfo.id}`
    });
  },

  // 跳转到相关课程
  goToRelatedCourse(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/courseDetail/courseDetail?id=${id}`
    });
  }
});
