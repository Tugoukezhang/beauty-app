/**
 * 学习记录页面
 * 功能：历史学习课程、学习进度、继续学习
 */

const userApi = require('../../api/user');

Page({
  data: {
    recordList: [],
    loading: false,
    empty: true
  },

  onLoad() {
    this.loadStudyRecords();
  },

  onShow() {
    this.loadStudyRecords();
  },

  onPullDownRefresh() {
    this.loadStudyRecords();
    wx.stopPullDownRefresh();
  },

  // 加载学习记录
  async loadStudyRecords() {
    this.setData({ loading: true });

    try {
      const result = await userApi.getStudyRecords();
      this.setData({
        recordList: result.list || [],
        empty: !result.list?.length
      });
    } catch (err) {
      // 模拟数据
      this.setMockData();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 模拟数据
  setMockData() {
    this.setData({
      recordList: [
        {
          id: 1,
          courseId: 101,
          courseTitle: '新娘妆入门教程',
          cover: '/assets/images/course-cover-1.png',
          teacher: '美妆导师Lily',
          progress: 75, // 进度百分比
          lastChapter: '第三章：眼妆技巧',
          lastTime: '2024-01-15 14:30',
          totalChapters: 12,
          completedChapters: 9
        },
        {
          id: 2,
          courseId: 102,
          courseTitle: '古风妆容设计',
          cover: 'https://picsum.photos/300/200?random=course2',
          teacher: '古风化妆师小雪',
          progress: 30,
          lastChapter: '第一章：古风妆基础',
          lastTime: '2024-01-14 20:15',
          totalChapters: 8,
          completedChapters: 2
        },
        {
          id: 3,
          courseId: 103,
          courseTitle: '影视特效妆',
          cover: '/assets/images/course-cover-3.png',
          teacher: '特效化妆师阿杰',
          progress: 100,
          lastChapter: '全部完成',
          lastTime: '2024-01-10 18:00',
          totalChapters: 10,
          completedChapters: 10
        }
      ],
      empty: false
    });
  },

  // 继续学习
  continueStudy(e) {
    const { courseId, id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/courseDetail/courseDetail?id=${courseId}&recordId=${id}`
    });
  },

  // 删除记录
  async deleteRecord(e) {
    const { id } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条学习记录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await userApi.deleteStudyRecord({ id });
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadStudyRecords();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
